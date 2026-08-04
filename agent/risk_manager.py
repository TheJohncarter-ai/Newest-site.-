"""
Capital preservation veto layer.
All action validation is pure rule-based logic — no LLM calls here.
"""

from __future__ import annotations

import time
from typing import Any

from . import config
from .utils import RiskViolationError, format_usd, format_pct, get_logger

logger = get_logger()


class RiskManager:
    def __init__(self) -> None:
        self.peak_portfolio_value: float = 0.0
        self._position_entries: dict[str, dict] = {}
        # {"WETH": {"entry_price_usd": 2400.0, "amount": 0.001, "entry_time": float}}

    # ── Strategy tier ─────────────────────────────────────────────────────────

    def calculate_strategy_tier(self, portfolio_value_usd: float) -> int:
        if portfolio_value_usd <= config.TIER_1_MAX_USD:
            return 1
        if portfolio_value_usd <= config.TIER_2_MAX_USD:
            return 2
        return 3

    # ── Portfolio state checks ─────────────────────────────────────────────────

    def update_peak_value(self, current_value: float) -> None:
        if current_value > self.peak_portfolio_value:
            self.peak_portfolio_value = current_value
            logger.info(f"New portfolio peak: {format_usd(current_value)}")

    def is_emergency_mode(self, current_value: float) -> bool:
        if self.peak_portfolio_value == 0:
            return False
        drawdown = 1.0 - (current_value / self.peak_portfolio_value)
        return drawdown >= config.MAX_DRAWDOWN_PCT

    def get_drawdown_pct(self, current_value: float) -> float:
        if self.peak_portfolio_value == 0:
            return 0.0
        return max(0.0, 1.0 - (current_value / self.peak_portfolio_value)) * 100

    # ── Individual rule checks ─────────────────────────────────────────────────

    def _check_position_size(
        self, action: dict, portfolio_value_usd: float
    ) -> tuple[bool, str]:
        amount_pct = action.get("amount_pct", 0)
        if amount_pct > config.MAX_SINGLE_POSITION_PCT:
            return False, (
                f"Position size {format_pct(amount_pct * 100)} exceeds "
                f"max {format_pct(config.MAX_SINGLE_POSITION_PCT * 100)}"
            )
        return True, ""

    def _check_stablecoin_floor(
        self,
        action: dict,
        balances: dict[str, float],
        prices: dict[str, float],
        portfolio_value_usd: float,
    ) -> tuple[bool, str]:
        if action.get("type") not in ("swap", "aave_withdraw"):
            return True, ""

        token_out = action.get("token_out", action.get("token", ""))
        token_in = action.get("token_in", "")

        # If we're swapping FROM a stablecoin, check post-action floor
        if token_in in config.STABLECOINS:
            amount_pct = action.get("amount_pct", 0)
            stable_value_usd = sum(
                balances.get(s, 0) * prices.get(s, 1.0) for s in config.STABLECOINS
            )
            trade_value = portfolio_value_usd * amount_pct
            post_stable_pct = (stable_value_usd - trade_value) / portfolio_value_usd
            if post_stable_pct < config.MIN_STABLECOIN_PCT:
                return False, (
                    f"Would drop stablecoin allocation to {format_pct(post_stable_pct * 100)}, "
                    f"below minimum {format_pct(config.MIN_STABLECOIN_PCT * 100)}"
                )
        return True, ""

    def _check_gas_reserve(
        self, matic_balance: float, gas_cost_matic: float
    ) -> tuple[bool, str]:
        post_balance = matic_balance - gas_cost_matic
        if post_balance < config.GAS_RESERVE_MATIC:
            return False, (
                f"Gas reserve would drop to {post_balance:.3f} MATIC, "
                f"below minimum {config.GAS_RESERVE_MATIC} MATIC"
            )
        return True, ""

    def _check_tier_allows(self, action: dict, tier: int) -> tuple[bool, str]:
        action_type = action.get("type")
        token_out = action.get("token_out", "")

        if tier == 1:
            # Only safe stable-yield actions
            if action_type == "aave_supply":
                token = action.get("token", "")
                if token in config.STABLECOINS or not token:
                    return True, ""
            if action_type == "hold":
                return True, ""
            return False, f"Tier 1 portfolio only allows Aave stablecoin deposits. Got: {action_type}"

        return True, ""

    # ── Stop-loss scanner ─────────────────────────────────────────────────────

    def check_stop_loss(
        self, balances: dict[str, float], prices: dict[str, float]
    ) -> list[dict]:
        triggered: list[dict] = []
        for symbol, entry in list(self._position_entries.items()):
            current_price = prices.get(symbol, 0)
            entry_price = entry.get("entry_price_usd", 0)
            if entry_price == 0 or current_price == 0:
                continue
            loss_pct = (entry_price - current_price) / entry_price
            if loss_pct >= config.STOP_LOSS_PCT:
                amount = balances.get(symbol, 0)
                logger.warning(
                    f"STOP-LOSS triggered: {symbol} down {format_pct(loss_pct * 100)} "
                    f"from entry {format_usd(entry_price)}"
                )
                triggered.append({
                    "type": "swap",
                    "token_in": symbol,
                    "token_out": "USDC",
                    "amount_pct_of_holding": 1.0,
                    "priority": 0,
                    "rationale": f"Stop-loss: {symbol} down {format_pct(loss_pct * 100)}",
                })
        return triggered

    # ── Emergency liquidation actions ─────────────────────────────────────────

    def get_emergency_liquidation_actions(
        self, balances: dict[str, float]
    ) -> list[dict]:
        actions = []
        for symbol, amount in balances.items():
            if symbol not in config.STABLECOINS and symbol not in ("MATIC", "WMATIC") and amount > 0:
                actions.append({
                    "type": "swap",
                    "token_in": symbol,
                    "token_out": "USDC",
                    "amount_pct_of_holding": 1.0,
                    "priority": 0,
                    "rationale": "Emergency liquidation: max drawdown breached",
                })
        return actions

    # ── Master validate ───────────────────────────────────────────────────────

    def validate_action(
        self,
        action: dict,
        balances: dict[str, float],
        prices: dict[str, float],
        portfolio_value_usd: float,
        matic_balance: float,
        gas_cost_matic: float = 0.01,
    ) -> tuple[bool, str]:
        tier = self.calculate_strategy_tier(portfolio_value_usd)

        checks = [
            self._check_tier_allows(action, tier),
            self._check_position_size(action, portfolio_value_usd),
            self._check_stablecoin_floor(action, balances, prices, portfolio_value_usd),
            self._check_gas_reserve(matic_balance, gas_cost_matic),
        ]

        for approved, reason in checks:
            if not approved:
                return False, reason

        return True, ""

    # ── Position tracking ─────────────────────────────────────────────────────

    def record_entry(self, symbol: str, amount: float, price_usd: float) -> None:
        self._position_entries[symbol] = {
            "entry_price_usd": price_usd,
            "amount": amount,
            "entry_time": time.time(),
        }
        logger.info(f"Position recorded: {symbol} @ {format_usd(price_usd)}")

    def remove_position(self, symbol: str) -> None:
        self._position_entries.pop(symbol, None)

    def get_positions(self) -> dict:
        return dict(self._position_entries)

    def get_safe_trade_size_usd(self, portfolio_value_usd: float, tier: int) -> float:
        if tier == 1:
            return 0.0
        max_pct = 0.10 if tier == 2 else config.MAX_SINGLE_POSITION_PCT
        return portfolio_value_usd * max_pct
