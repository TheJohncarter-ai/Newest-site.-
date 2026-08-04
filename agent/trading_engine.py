"""
Action routing, gas cost pre-checks, and execution.
Every action passes through risk_manager before being executed here.
"""

from __future__ import annotations

from typing import Any

from . import config
from .defi_manager import DeFiManager
from .risk_manager import RiskManager
from .utils import (
    DeFiError,
    InsufficientFundsError,
    RiskViolationError,
    format_usd,
    get_logger,
    token_to_wei,
    wei_to_token,
)
from .wallet import WalletManager

logger = get_logger()


class TradingEngine:
    def __init__(
        self,
        wallet: WalletManager,
        defi: DeFiManager,
        risk: RiskManager,
    ) -> None:
        self.wallet = wallet
        self.defi = defi
        self.risk = risk

    # ── Gas cost pre-check ────────────────────────────────────────────────────

    def _estimate_gas_cost_usd(self, action_type: str, prices: dict) -> float:
        gas_units = {
            "aave_supply": 200_000,
            "aave_withdraw": 220_000,
            "swap": 300_000,
        }.get(action_type, 200_000)
        matic_price = prices.get("MATIC", 0.8)
        return self.wallet.estimate_gas_cost_usd(gas_units, matic_price)

    def _gas_too_expensive(
        self, action: dict, trade_value_usd: float, prices: dict
    ) -> tuple[bool, str]:
        gas_usd = self._estimate_gas_cost_usd(action.get("type", ""), prices)
        if trade_value_usd > 0 and gas_usd / trade_value_usd > config.MAX_GAS_COST_RATIO:
            return True, (
                f"Gas cost {format_usd(gas_usd)} is "
                f"{gas_usd / trade_value_usd * 100:.1f}% of trade value — too expensive"
            )
        return False, ""

    # ── Slippage helper ───────────────────────────────────────────────────────

    def _slippage_for_pair(self, from_symbol: str, to_symbol: str) -> float:
        if from_symbol in config.STABLECOINS and to_symbol in config.STABLECOINS:
            return config.SLIPPAGE_STABLE_STABLE
        if "MATIC" in (from_symbol, to_symbol):
            return config.SLIPPAGE_MATIC_STABLE
        return config.SLIPPAGE_VOLATILE

    # ── Action resolvers ──────────────────────────────────────────────────────

    def _resolve_amount(
        self,
        action: dict,
        balances: dict[str, float],
        portfolio_value_usd: float,
        prices: dict[str, float],
    ) -> float:
        """Return the absolute token amount for the action."""
        action_type = action.get("type")

        if action_type == "aave_supply":
            token = action.get("token", "USDC")
            pct_of_holding = action.get("amount_pct_of_holding", 0.9)
            return balances.get(token, 0) * pct_of_holding

        if action_type == "aave_withdraw":
            token = action.get("token", "USDC")
            pct_of_holding = action.get("amount_pct_of_holding", 1.0)
            # If None/1.0 = full withdrawal
            return None if pct_of_holding >= 1.0 else None  # handled in defi_manager

        if action_type == "swap":
            token_in = action.get("token_in", "")
            amount_pct = action.get("amount_pct", 0)
            pct_of_holding = action.get("amount_pct_of_holding", 0)

            if pct_of_holding:
                return balances.get(token_in, 0) * pct_of_holding
            elif amount_pct:
                usd_amount = portfolio_value_usd * amount_pct
                price = prices.get(token_in, 1.0)
                return usd_amount / price if price > 0 else 0

        return 0.0

    # ── Single action execution ───────────────────────────────────────────────

    def execute_action(
        self,
        action: dict,
        balances: dict[str, float],
        prices: dict[str, float],
        portfolio_value_usd: float,
        dry_run: bool = False,
    ) -> dict:
        action_type = action.get("type", "")
        result = {"status": "failed", "tx_hash": None, "reason": ""}

        if action_type == "hold":
            logger.info("Action: HOLD — no trades this cycle")
            return {"status": "success", "tx_hash": None, "reason": "hold"}

        try:
            if action_type == "aave_supply":
                token = action.get("token", "USDC")
                amount = self._resolve_amount(action, balances, portfolio_value_usd, prices)
                if amount <= 0:
                    return {"status": "skipped", "reason": f"No {token} balance to supply"}

                trade_value_usd = amount * prices.get(token, 1.0)
                expensive, reason = self._gas_too_expensive(action, trade_value_usd, prices)
                if expensive:
                    return {"status": "skipped", "reason": reason}

                logger.info(f"Executing aave_supply: {amount:.4f} {token} ({format_usd(trade_value_usd)})")
                tx_hash = self.defi.aave_supply(token, amount, dry_run=dry_run)
                result = {"status": "success", "tx_hash": tx_hash, "amount": amount, "token": token}

            elif action_type == "aave_withdraw":
                token = action.get("token", "USDC")
                full_withdraw = action.get("amount_pct_of_holding", 1.0) >= 1.0
                logger.info(f"Executing aave_withdraw: {'ALL' if full_withdraw else ''} {token}")
                tx_hash = self.defi.aave_withdraw(token, None if full_withdraw else None, dry_run=dry_run)
                result = {"status": "success", "tx_hash": tx_hash, "token": token}

            elif action_type == "swap":
                from_symbol = action.get("token_in", "")
                to_symbol = action.get("token_out", "")
                amount = self._resolve_amount(action, balances, portfolio_value_usd, prices)

                if amount <= 0 or not from_symbol or not to_symbol:
                    return {"status": "skipped", "reason": "Invalid swap parameters"}

                trade_value_usd = amount * prices.get(from_symbol, 1.0)
                expensive, reason = self._gas_too_expensive(action, trade_value_usd, prices)
                if expensive:
                    return {"status": "skipped", "reason": reason}

                slippage = self._slippage_for_pair(from_symbol, to_symbol)
                decimals_in = config.TOKENS[from_symbol]["decimals"]
                amount_wei = token_to_wei(amount, decimals_in)

                logger.info(
                    f"Executing swap: {amount:.4f} {from_symbol} → {to_symbol} "
                    f"({format_usd(trade_value_usd)}, slippage {slippage * 100:.1f}%)"
                )

                # Try 1inch first (better for small amounts), fallback to Uniswap
                tx_hash = None
                try:
                    tx_hash = self.defi.oneinch_swap(
                        from_symbol, to_symbol, amount_wei, slippage * 100, dry_run=dry_run
                    )
                except Exception as e:
                    logger.warning(f"1inch swap failed ({e}), trying Uniswap...")
                    quote_out = self.defi.uniswap_quote(from_symbol, to_symbol, amount_wei)
                    min_out = int(quote_out * (1 - slippage)) if quote_out else 1
                    tx_hash = self.defi.uniswap_swap(
                        from_symbol, to_symbol, amount_wei, min_out, dry_run=dry_run
                    )

                result = {
                    "status": "success",
                    "tx_hash": tx_hash,
                    "from": from_symbol,
                    "to": to_symbol,
                    "amount": amount,
                }

            else:
                result = {"status": "skipped", "reason": f"Unknown action type: {action_type}"}

        except InsufficientFundsError as e:
            result = {"status": "failed", "reason": f"Insufficient funds: {e}"}
            logger.error(f"Action failed (insufficient funds): {e}")
        except DeFiError as e:
            result = {"status": "failed", "reason": f"DeFi error: {e}"}
            logger.error(f"Action failed (DeFi): {e}")
        except Exception as e:
            result = {"status": "failed", "reason": str(e)}
            logger.error(f"Action failed (unexpected): {e}", exc_info=True)

        return result

    # ── Multi-action plan execution ───────────────────────────────────────────

    def execute_action_plan(
        self,
        actions: list[dict],
        balances: dict[str, float],
        prices: dict[str, float],
        portfolio_value_usd: float,
        matic_balance: float,
        dry_run: bool = False,
    ) -> list[dict]:
        if not actions:
            return []

        # Sort by priority (lower number = higher priority)
        sorted_actions = sorted(actions, key=lambda a: a.get("priority", 99))

        results = []
        for action in sorted_actions:
            # Validate through risk manager
            gas_matic = self._estimate_gas_cost_usd(action.get("type", ""), prices) / prices.get("MATIC", 0.8)
            approved, reason = self.risk.validate_action(
                action, balances, prices, portfolio_value_usd, matic_balance, gas_matic
            )
            if not approved:
                logger.warning(f"Action rejected by risk manager: {reason} | action={action}")
                results.append({
                    "action": action,
                    "status": "rejected",
                    "reason": reason,
                })
                continue

            result = self.execute_action(action, balances, prices, portfolio_value_usd, dry_run=dry_run)
            result["action"] = action
            results.append(result)

            # Update matic_balance estimate after gas spend
            gas_cost = self._estimate_gas_cost_usd(action.get("type", ""), prices)
            matic_price = prices.get("MATIC", 0.8)
            matic_balance = max(0, matic_balance - gas_cost / matic_price)

        return results
