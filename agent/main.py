"""
Autonomous Crypto DeFi Agent — entry point.

Usage:
  python -m agent.main                  # Run continuously (30-min cycles)
  python -m agent.main --dry-run        # Simulate — no real transactions
  python -m agent.main --once           # Run one cycle then exit
  python -m agent.main --check-wallet   # Show wallet info and balances, then exit
  python -m agent.main --create-wallet  # Generate a new Polygon wallet
"""

from __future__ import annotations

import os
import sys
import time
import threading
import argparse
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3

from . import config
from .brain import AgentBrain
from .data_feeds import DataFeedManager
from .defi_manager import DeFiManager
from .market_analyzer import MarketAnalyzer
from .portfolio_tracker import PortfolioTracker
from .risk_manager import RiskManager
from .trading_engine import TradingEngine
from .utils import format_usd, format_pct, get_logger, now_iso, setup_logging
from .wallet import WalletManager

_stop_flag = threading.Event()


# ── Startup helpers ───────────────────────────────────────────────────────────

def _connect_web3() -> Web3:
    rpc_urls = [
        os.environ.get("ALCHEMY_POLYGON_RPC", ""),
        os.environ.get("INFURA_POLYGON_RPC", ""),
        os.environ.get("PUBLIC_POLYGON_RPC", "https://polygon-rpc.com"),
        "https://rpc-mainnet.matic.quiknode.pro",
        "https://polygon-bor-rpc.publicnode.com",
    ]
    for url in rpc_urls:
        if not url:
            continue
        try:
            w3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 10}))
            if w3.is_connected() and w3.eth.chain_id == config.CHAIN_ID:
                logger = get_logger()
                logger.info(f"Connected to Polygon via {url[:50]}...")
                return w3
        except Exception:
            continue
    raise ConnectionError("Could not connect to any Polygon RPC. Check your RPC URLs in .env")


def _init_components(w3: Web3) -> dict:
    wallet = WalletManager(w3)
    wallet.load_wallet_from_env()

    feeds = DataFeedManager()
    risk = RiskManager()
    defi = DeFiManager(w3, wallet)
    tracker = PortfolioTracker(
        portfolio_file=os.environ.get("PORTFOLIO_DB", "agent/data/portfolio.jsonl"),
        actions_file="agent/data/actions.jsonl",
    )
    analyzer = MarketAnalyzer(feeds)
    engine = TradingEngine(wallet, defi, risk)
    brain = AgentBrain()

    return {
        "w3": w3,
        "wallet": wallet,
        "feeds": feeds,
        "risk": risk,
        "defi": defi,
        "tracker": tracker,
        "analyzer": analyzer,
        "engine": engine,
        "brain": brain,
    }


# ── Decision cycle ────────────────────────────────────────────────────────────

def run_decision_cycle(components: dict, cycle: int, dry_run: bool) -> dict:
    logger = get_logger()
    wallet: WalletManager = components["wallet"]
    feeds: DataFeedManager = components["feeds"]
    risk: RiskManager = components["risk"]
    defi: DeFiManager = components["defi"]
    tracker: PortfolioTracker = components["tracker"]
    analyzer: MarketAnalyzer = components["analyzer"]
    engine: TradingEngine = components["engine"]
    brain: AgentBrain = components["brain"]
    w3: Web3 = components["w3"]

    logger.info(f"━━━ Cycle {cycle} started at {now_iso()} ━━━")

    # Phase 1: Collect data
    balances = wallet.get_all_balances()
    market_snapshot = feeds.build_market_snapshot(w3)
    prices = market_snapshot["prices"]
    defi_positions = defi.get_all_defi_positions(prices)

    # Phase 2: Portfolio assessment
    portfolio_value = wallet.get_portfolio_value_usd(balances, prices)
    # Add DeFi position value
    aave_value = sum(
        pos.get("supplied_usd", 0)
        for pos in defi_positions.get("aave", {}).values()
    )
    portfolio_value += aave_value

    risk.update_peak_value(portfolio_value)
    tier = risk.calculate_strategy_tier(portfolio_value)
    matic_balance = balances.get("MATIC", 0)

    logger.info(
        f"Portfolio: {format_usd(portfolio_value)} | Tier {tier} | "
        f"MATIC: {matic_balance:.3f} | Stables: "
        f"{format_pct(sum(balances.get(s,0)*prices.get(s,1) for s in config.STABLECOINS)/portfolio_value*100 if portfolio_value else 0)}"
    )

    # Phase 2a: Stop-loss check
    stop_actions = risk.check_stop_loss(balances, prices)
    if stop_actions:
        logger.warning(f"Stop-loss triggered for {len(stop_actions)} position(s)!")
        results = engine.execute_action_plan(
            stop_actions, balances, prices, portfolio_value, matic_balance, dry_run=dry_run
        )
        for r in results:
            if r.get("status") == "success":
                risk.remove_position(r.get("action", {}).get("token_in", ""))
        return {"cycle": cycle, "stop_loss": True, "results": results}

    # Phase 2b: Emergency mode
    if risk.is_emergency_mode(portfolio_value):
        logger.error(
            f"EMERGENCY MODE: portfolio {format_usd(portfolio_value)} "
            f"vs peak {format_usd(risk.peak_portfolio_value)} "
            f"({format_pct(risk.get_drawdown_pct(portfolio_value))} drawdown)"
        )
        emergency_actions = risk.get_emergency_liquidation_actions(balances)
        engine.execute_action_plan(
            emergency_actions, balances, prices, portfolio_value, matic_balance, dry_run=dry_run
        )
        return {"cycle": cycle, "emergency": True}

    # Phase 3: Action history for context
    action_history = tracker.get_action_history(limit=10)

    # Phase 4: Build Claude context
    context = analyzer.build_context_for_claude(
        balances=balances,
        defi_positions=defi_positions,
        prices=prices,
        market_snapshot=market_snapshot,
        action_history=action_history,
        portfolio_value_usd=portfolio_value,
        strategy_tier=tier,
        cycle_number=cycle,
        peak_value_usd=risk.peak_portfolio_value,
    )

    # Phase 5: Claude decides
    action_plan = brain.analyze_and_decide(context)
    actions = action_plan.get("actions", [])
    logger.info(f"Claude reasoning: {action_plan.get('reasoning', '')[:200]}")

    # Phase 6: Execute
    value_before = portfolio_value
    results = []
    if actions:
        results = engine.execute_action_plan(
            actions, balances, prices, portfolio_value, matic_balance, dry_run=dry_run
        )
        # Track position entries for stop-loss
        for r in results:
            if r.get("status") == "success":
                action = r.get("action", {})
                if action.get("type") == "swap":
                    token_out = action.get("token_out", "")
                    if token_out not in config.STABLECOINS:
                        risk.record_entry(token_out, r.get("amount", 0), prices.get(token_out, 0))
    else:
        logger.info("No actions this cycle — holding")

    # Phase 7: Snapshot
    balances_after = wallet.get_all_balances()
    defi_after = defi.get_all_defi_positions(prices)
    snap = tracker.snapshot(balances_after, defi_after, prices, cycle)
    tracker.save_snapshot(snap)

    value_after = snap.get("total_value_usd", portfolio_value)
    for r in results:
        if r.get("status") == "success":
            tracker.log_action(r.get("action", {}), r, value_before, value_after)

    pnl_cycle = value_after - value_before
    logger.info(
        f"Cycle {cycle} complete | "
        f"Portfolio: {format_usd(value_after)} | "
        f"Cycle PnL: {format_usd(pnl_cycle)} | "
        f"All-time: {format_pct(snap.get('pnl_pct', 0))}"
    )

    return {"cycle": cycle, "portfolio_value": value_after, "results": results}


# ── Background stop-loss watcher ──────────────────────────────────────────────

def _stop_loss_watcher(components: dict, dry_run: bool) -> None:
    """Runs every 60s independent of the main cycle to catch rapid drops."""
    logger = get_logger()
    while not _stop_flag.is_set():
        try:
            wallet: WalletManager = components["wallet"]
            feeds: DataFeedManager = components["feeds"]
            risk: RiskManager = components["risk"]
            engine: TradingEngine = components["engine"]
            defi: DeFiManager = components["defi"]

            prices = feeds.get_token_prices_usd()
            balances = wallet.get_all_balances()
            portfolio_value = wallet.get_portfolio_value_usd(balances, prices)
            matic_balance = balances.get("MATIC", 0)

            stop_actions = risk.check_stop_loss(balances, prices)
            if stop_actions:
                logger.warning("[StopLoss Watcher] Triggered! Executing emergency exit...")
                engine.execute_action_plan(
                    stop_actions, balances, prices, portfolio_value, matic_balance, dry_run=dry_run
                )
        except Exception as e:
            logger.warning(f"[StopLoss Watcher] Error: {e}")

        _stop_flag.wait(config.STOP_LOSS_POLL_SECONDS)


# ── CLI commands ──────────────────────────────────────────────────────────────

def cmd_check_wallet(w3: Web3) -> None:
    logger = get_logger()
    wallet = WalletManager(w3)
    wallet.load_wallet_from_env()

    feeds = DataFeedManager()
    prices = feeds.get_token_prices_usd()
    balances = wallet.get_all_balances()
    total = wallet.get_portfolio_value_usd(balances, prices)

    logger.info(f"Wallet: {wallet.get_wallet_address()}")
    logger.info(f"Network: Polygon (chain {w3.eth.chain_id})")
    logger.info(f"Block:   #{w3.eth.block_number}")
    logger.info("Balances:")
    for symbol, amount in balances.items():
        if amount > 0.000001:
            usd = amount * prices.get(symbol, 0)
            logger.info(f"  {symbol:8s}: {amount:>14.6f}  ({format_usd(usd)})")
    logger.info(f"Total value: {format_usd(total)}")
    feeds.close()


def cmd_create_wallet() -> None:
    logger = get_logger()
    from eth_account import Account
    acct = Account.create()
    logger.info("=" * 60)
    logger.info("NEW POLYGON WALLET GENERATED")
    logger.info("=" * 60)
    logger.info(f"Address:     {acct.address}")
    logger.info(f"Private key: {acct.key.hex()}")
    logger.info("")
    logger.info("Add to your .env file:")
    logger.info(f"  WALLET_ADDRESS={acct.address}")
    logger.info(f"  WALLET_PRIVATE_KEY={acct.key.hex()}")
    logger.info("")
    logger.info("Fund with $10 USDC + 0.5 MATIC on Polygon before starting the agent.")
    logger.info("=" * 60)


# ── Main entry point ──────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Autonomous Crypto DeFi Agent")
    parser.add_argument("--dry-run", action="store_true", help="Simulate — no real transactions")
    parser.add_argument("--once", action="store_true", help="Run one decision cycle then exit")
    parser.add_argument("--check-wallet", action="store_true", help="Show wallet balances and exit")
    parser.add_argument("--create-wallet", action="store_true", help="Generate a new wallet and exit")
    parser.add_argument("--log-level", default=None, help="LOG_LEVEL override (DEBUG/INFO/WARNING)")
    args = parser.parse_args()

    load_dotenv()

    log_level = args.log_level or os.environ.get("LOG_LEVEL", "INFO")
    log_file = os.environ.get("LOG_FILE", "agent/data/agent.log")
    setup_logging(log_level, log_file)
    logger = get_logger()

    if args.create_wallet:
        cmd_create_wallet()
        return

    logger.info("Starting Autonomous Crypto DeFi Agent...")

    w3 = _connect_web3()

    if args.check_wallet:
        cmd_check_wallet(w3)
        return

    components = _init_components(w3)
    dry_run = args.dry_run or os.environ.get("DRY_RUN", "false").lower() == "true"

    if dry_run:
        logger.info("[DRY RUN MODE] — No real transactions will be executed")

    # Show initial state
    wallet: WalletManager = components["wallet"]
    feeds: DataFeedManager = components["feeds"]
    prices = feeds.get_token_prices_usd()
    balances = wallet.get_all_balances()
    total = wallet.get_portfolio_value_usd(balances, prices)
    tier = components["risk"].calculate_strategy_tier(total)
    components["risk"].update_peak_value(total)

    logger.info(
        f"Agent ready | Wallet: {wallet.get_wallet_address()} | "
        f"Portfolio: {format_usd(total)} | Tier {tier}"
    )

    if balances.get("MATIC", 0) < config.GAS_RESERVE_MATIC:
        logger.warning(
            f"MATIC balance ({balances.get('MATIC', 0):.3f}) is below gas reserve "
            f"({config.GAS_RESERVE_MATIC}). Top up MATIC before running live."
        )

    if args.once:
        run_decision_cycle(components, cycle=1, dry_run=dry_run)
        return

    # Start stop-loss watcher thread
    watcher = threading.Thread(
        target=_stop_loss_watcher,
        args=(components, dry_run),
        daemon=True,
        name="StopLossWatcher",
    )
    watcher.start()

    # Main loop
    cycle = 1
    try:
        while True:
            try:
                run_decision_cycle(components, cycle=cycle, dry_run=dry_run)
            except KeyboardInterrupt:
                raise
            except Exception as e:
                logger.error(f"Cycle {cycle} failed: {e}", exc_info=True)
                logger.info("Waiting before next cycle...")

            cycle += 1
            logger.info(f"Next cycle in {config.DECISION_INTERVAL_SECONDS // 60} minutes...")
            time.sleep(config.DECISION_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("Agent stopped by user.")
    finally:
        _stop_flag.set()
        feeds.close()
        components.get("defi").close()


if __name__ == "__main__":
    main()
