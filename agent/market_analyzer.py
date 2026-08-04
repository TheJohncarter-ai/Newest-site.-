"""Market opportunity scoring and context assembly for Claude."""

from __future__ import annotations

from typing import Any

from . import config
from .data_feeds import DataFeedManager
from .utils import get_logger, now_iso

logger = get_logger()


class MarketAnalyzer:
    def __init__(self, feeds: DataFeedManager) -> None:
        self.feeds = feeds

    # ── Opportunity scoring ────────────────────────────────────────────────────

    def score_yield_opportunity(self, pool: dict) -> float:
        """Score 0–100: higher is better. Weights APY, TVL, risk."""
        import math
        apy = pool.get("apy", 0)
        tvl = pool.get("tvl_usd", 0)
        risk = pool.get("risk", "high")

        apy_score = min(apy / 20 * 40, 40)  # cap at 20% APY = 40 pts
        tvl_score = min(math.log10(max(tvl, 1)) / 9 * 30, 30)  # $1B TVL = 30 pts
        risk_score = {"low": 30, "medium": 15, "high": 0}.get(risk, 0)

        return round(apy_score + tvl_score + risk_score, 1)

    def find_best_yield_opportunities(self, tier: int) -> list[dict]:
        all_yields = self.feeds.get_defillama_yields()
        scored = [
            {**p, "score": self.score_yield_opportunity(p)}
            for p in all_yields
        ]
        scored.sort(key=lambda x: x["score"], reverse=True)

        # Tier 1: only established stable protocols
        if tier == 1:
            safe = [p for p in scored if p.get("risk") == "low" and
                    any(s.lower() in p.get("token", "").lower()
                        for s in ["usdc", "usdt", "dai", "usd"])]
            return safe[:5]

        return scored[:10]

    # ── Context assembly for Claude ────────────────────────────────────────────

    def build_context_for_claude(
        self,
        balances: dict[str, float],
        defi_positions: dict[str, Any],
        prices: dict[str, float],
        market_snapshot: dict,
        action_history: list[dict],
        portfolio_value_usd: float,
        strategy_tier: int,
        cycle_number: int,
        peak_value_usd: float,
        initial_capital_usd: float = 10.0,
    ) -> dict:
        pnl_pct = ((portfolio_value_usd - initial_capital_usd) / initial_capital_usd) * 100
        drawdown_pct = max(0.0, (1 - portfolio_value_usd / peak_value_usd) * 100) if peak_value_usd > 0 else 0

        # Build allocation view
        allocations: dict[str, dict] = {}
        for symbol, amount in balances.items():
            if amount > 0.0001:
                val = amount * prices.get(symbol, 0)
                allocations[symbol] = {
                    "amount": round(amount, 6),
                    "value_usd": round(val, 4),
                    "pct": round(val / portfolio_value_usd * 100, 2) if portfolio_value_usd > 0 else 0,
                    "location": "wallet",
                }
        for token, pos in defi_positions.get("aave", {}).items():
            supplied_usd = pos.get("supplied_usd", 0)
            if supplied_usd > 0:
                allocations[f"{token}(aave)"] = {
                    "amount": round(pos.get("supplied", 0), 6),
                    "value_usd": round(supplied_usd, 4),
                    "pct": round(supplied_usd / portfolio_value_usd * 100, 2) if portfolio_value_usd > 0 else 0,
                    "location": "aave",
                    "current_apy": pos.get("apy", 0),
                }

        # Compute stablecoin percentage
        stable_value = sum(
            balances.get(s, 0) * prices.get(s, 1)
            for s in config.STABLECOINS
        ) + sum(
            defi_positions.get("aave", {}).get(s, {}).get("supplied_usd", 0)
            for s in config.STABLECOINS
        )
        stable_pct = (stable_value / portfolio_value_usd * 100) if portfolio_value_usd > 0 else 0

        # Recent actions summary
        recent = []
        for entry in action_history[-10:]:
            a = entry.get("action", {})
            r = entry.get("result", {})
            recent.append({
                "type": a.get("type"),
                "token": a.get("token", a.get("token_in", "")),
                "status": r.get("status", "unknown"),
                "ts": entry.get("timestamp", ""),
            })

        best_yields = self.find_best_yield_opportunities(strategy_tier)
        aave_yields = market_snapshot.get("aave_yields", {})

        return {
            "timestamp": now_iso(),
            "cycle_number": cycle_number,
            "portfolio": {
                "total_value_usd": round(portfolio_value_usd, 4),
                "initial_capital_usd": initial_capital_usd,
                "pnl_pct": round(pnl_pct, 2),
                "strategy_tier": strategy_tier,
                "peak_value_usd": round(peak_value_usd, 4),
                "drawdown_from_peak_pct": round(drawdown_pct, 2),
                "stablecoin_pct": round(stable_pct, 2),
                "allocations": allocations,
            },
            "market_data": {
                "prices": {k: round(v, 4) for k, v in prices.items()},
                "price_changes_24h": market_snapshot.get("price_changes_24h", {}),
                "fear_greed_index": market_snapshot.get("fear_greed_index", {}),
                "gas_price_gwei": market_snapshot.get("gas_price_gwei", 35),
                "estimated_swap_cost_usd": market_snapshot.get("estimated_swap_cost_usd", 0.002),
            },
            "yield_opportunities": best_yields[:5],
            "aave_yields_polygon": aave_yields,
            "recent_actions": recent,
            "risk_state": {
                "stablecoin_pct": round(stable_pct, 2),
                "min_stablecoin_pct": config.MIN_STABLECOIN_PCT * 100,
                "max_single_position_pct": config.MAX_SINGLE_POSITION_PCT * 100,
                "emergency_mode": drawdown_pct >= config.MAX_DRAWDOWN_PCT * 100,
                "gas_reserve_matic": config.GAS_RESERVE_MATIC,
                "matic_balance": round(balances.get("MATIC", 0), 4),
            },
            "constraints": {
                "tier_1_only_stable_yield": strategy_tier == 1,
                "tier_2_max_volatile_pct": 10 if strategy_tier == 2 else None,
                "stop_loss_pct": config.STOP_LOSS_PCT * 100,
                "max_gas_cost_ratio": config.MAX_GAS_COST_RATIO * 100,
            },
        }
