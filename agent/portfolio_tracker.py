"""JSONL-based portfolio snapshot history and action log."""

from __future__ import annotations

import json
import os
from typing import Any

from .utils import format_pct, format_usd, get_logger, now_iso, now_ts

logger = get_logger()

INITIAL_CAPITAL_USD = 10.0


class PortfolioTracker:
    def __init__(
        self,
        portfolio_file: str = "agent/data/portfolio.jsonl",
        actions_file: str = "agent/data/actions.jsonl",
    ) -> None:
        self.portfolio_file = portfolio_file
        self.actions_file = actions_file
        os.makedirs(os.path.dirname(portfolio_file), exist_ok=True)

    # ── Snapshot ──────────────────────────────────────────────────────────────

    def snapshot(
        self,
        balances: dict[str, float],
        defi_positions: dict[str, Any],
        prices: dict[str, float],
        cycle_number: int = 0,
    ) -> dict:
        total_wallet = sum(balances.get(s, 0) * prices.get(s, 0) for s in balances)

        # Add Aave supplied amounts
        aave_value = 0.0
        for token, pos in defi_positions.get("aave", {}).items():
            aave_value += pos.get("supplied_usd", 0)

        total_value = total_wallet + aave_value

        stable_value = sum(
            (balances.get(s, 0) + defi_positions.get("aave", {}).get(s, {}).get("supplied", 0))
            * prices.get(s, 1.0)
            for s in ["USDC", "USDC_E", "USDT", "DAI"]
        )
        stable_pct = (stable_value / total_value * 100) if total_value > 0 else 0

        pnl_abs = total_value - INITIAL_CAPITAL_USD
        pnl_pct = (pnl_abs / INITIAL_CAPITAL_USD) * 100

        allocations: dict[str, dict] = {}
        for symbol, amount in balances.items():
            if amount > 0:
                val = amount * prices.get(symbol, 0)
                allocations[symbol] = {
                    "amount": amount,
                    "value_usd": round(val, 4),
                    "pct": round(val / total_value * 100, 2) if total_value > 0 else 0,
                    "location": "wallet",
                }
        for token, pos in defi_positions.get("aave", {}).items():
            if pos.get("supplied_usd", 0) > 0:
                allocations[f"{token}(aave)"] = {
                    "amount": pos.get("supplied", 0),
                    "value_usd": round(pos.get("supplied_usd", 0), 4),
                    "pct": round(pos.get("supplied_usd", 0) / total_value * 100, 2) if total_value > 0 else 0,
                    "location": "aave",
                }

        snap = {
            "timestamp": now_iso(),
            "ts": now_ts(),
            "cycle": cycle_number,
            "total_value_usd": round(total_value, 4),
            "wallet_value_usd": round(total_wallet, 4),
            "defi_value_usd": round(aave_value, 4),
            "stablecoin_pct": round(stable_pct, 2),
            "pnl_absolute_usd": round(pnl_abs, 4),
            "pnl_pct": round(pnl_pct, 2),
            "initial_capital_usd": INITIAL_CAPITAL_USD,
            "allocations": allocations,
        }
        return snap

    def save_snapshot(self, snapshot: dict) -> None:
        try:
            # Prune old lines (keep last 1000)
            lines: list[str] = []
            if os.path.exists(self.portfolio_file):
                with open(self.portfolio_file) as f:
                    lines = f.readlines()[-999:]

            with open(self.portfolio_file, "w") as f:
                for line in lines:
                    f.write(line)
                f.write(json.dumps(snapshot) + "\n")
        except Exception as e:
            logger.error(f"Failed to save portfolio snapshot: {e}")

    def load_latest_snapshot(self) -> dict | None:
        if not os.path.exists(self.portfolio_file):
            return None
        try:
            with open(self.portfolio_file) as f:
                lines = [l.strip() for l in f if l.strip()]
            if lines:
                return json.loads(lines[-1])
        except Exception as e:
            logger.error(f"Failed to load snapshot: {e}")
        return None

    def load_snapshot_history(self, limit: int = 100) -> list[dict]:
        if not os.path.exists(self.portfolio_file):
            return []
        try:
            with open(self.portfolio_file) as f:
                lines = [l.strip() for l in f if l.strip()]
            return [json.loads(l) for l in lines[-limit:]]
        except Exception:
            return []

    # ── PnL helpers ───────────────────────────────────────────────────────────

    def get_performance_summary(self) -> dict:
        history = self.load_snapshot_history(50)
        if not history:
            return {}

        latest = history[-1]
        total = latest.get("total_value_usd", 0)
        pnl_pct = latest.get("pnl_pct", 0)

        change_24h = 0.0
        change_7d = 0.0
        ts_now = now_ts()
        for snap in reversed(history[:-1]):
            age = ts_now - snap.get("ts", 0)
            if age <= 86400 and change_24h == 0:
                change_24h = total - snap.get("total_value_usd", total)
            if age <= 604800 and change_7d == 0:
                change_7d = total - snap.get("total_value_usd", total)

        return {
            "total_value_usd": total,
            "pnl_pct_all_time": pnl_pct,
            "change_24h_usd": round(change_24h, 4),
            "change_7d_usd": round(change_7d, 4),
            "snapshots_count": len(history),
        }

    # ── Action log ────────────────────────────────────────────────────────────

    def log_action(
        self,
        action: dict,
        result: dict,
        portfolio_value_before: float,
        portfolio_value_after: float,
    ) -> None:
        entry = {
            "timestamp": now_iso(),
            "action": action,
            "result": result,
            "portfolio_before_usd": round(portfolio_value_before, 4),
            "portfolio_after_usd": round(portfolio_value_after, 4),
        }
        try:
            with open(self.actions_file, "a") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.error(f"Failed to log action: {e}")

    def get_action_history(self, limit: int = 50) -> list[dict]:
        if not os.path.exists(self.actions_file):
            return []
        try:
            with open(self.actions_file) as f:
                lines = [l.strip() for l in f if l.strip()]
            return [json.loads(l) for l in lines[-limit:]]
        except Exception:
            return []

    def print_summary(self) -> None:
        snap = self.load_latest_snapshot()
        if not snap:
            logger.info("No portfolio history yet.")
            return
        total = snap.get("total_value_usd", 0)
        pnl = snap.get("pnl_pct", 0)
        stable_pct = snap.get("stablecoin_pct", 0)
        logger.info(
            f"Portfolio: {format_usd(total)} | PnL: {format_pct(pnl)} | "
            f"Stables: {format_pct(stable_pct)}"
        )
