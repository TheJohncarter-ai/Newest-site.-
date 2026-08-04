"""Market data aggregation: prices, yields, gas, sentiment — all cached."""

from __future__ import annotations

import time
from typing import Any

import httpx

from . import config
from .utils import get_logger, now_iso, retry_with_backoff

logger = get_logger()


class DataFeedManager:
    def __init__(self) -> None:
        self._cache: dict[str, Any] = {}
        self._cache_ts: dict[str, float] = {}
        self._client = httpx.Client(timeout=15.0)

    def _cached(self, key: str, ttl: int = config.MARKET_DATA_CACHE_TTL) -> Any | None:
        if key in self._cache and time.time() - self._cache_ts.get(key, 0) < ttl:
            return self._cache[key]
        return None

    def _store(self, key: str, value: Any) -> None:
        self._cache[key] = value
        self._cache_ts[key] = time.time()

    # ── Price data ─────────────────────────────────────────────────────────────

    @retry_with_backoff(max_retries=3, base_delay=2.0)
    def get_coingecko_prices(self) -> dict[str, float]:
        cached = self._cached("prices")
        if cached:
            return cached

        ids = list({v["coingecko_id"] for v in config.TOKENS.values() if "coingecko_id" in v})
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": ",".join(ids),
            "vs_currencies": "usd",
            "include_24hr_change": "true",
        }
        resp = self._client.get(url, params=params)
        resp.raise_for_status()
        raw: dict = resp.json()

        prices: dict[str, float] = {}
        changes: dict[str, float] = {}
        for symbol, meta in config.TOKENS.items():
            cg_id = meta.get("coingecko_id")
            if cg_id and cg_id in raw:
                prices[symbol] = raw[cg_id].get("usd", 0.0)
                changes[symbol] = raw[cg_id].get("usd_24h_change", 0.0)

        result = {"prices": prices, "changes_24h": changes}
        self._store("prices", result)
        return result

    def get_token_prices_usd(self) -> dict[str, float]:
        return self.get_coingecko_prices()["prices"]

    def get_price_changes_24h(self) -> dict[str, float]:
        return self.get_coingecko_prices()["changes_24h"]

    # ── DeFi yields ────────────────────────────────────────────────────────────

    @retry_with_backoff(max_retries=3, base_delay=2.0)
    def get_defillama_yields(
        self,
        chain: str = "Polygon",
        min_tvl: float = 1_000_000,
        min_apy: float = 0.5,
    ) -> list[dict]:
        cached = self._cached("yields")
        if cached:
            return cached

        resp = self._client.get("https://yields.llama.fi/pools")
        resp.raise_for_status()
        all_pools: list[dict] = resp.json().get("data", [])

        filtered = [
            {
                "protocol": p.get("project", ""),
                "token": p.get("symbol", ""),
                "apy": p.get("apy", 0.0),
                "tvl_usd": p.get("tvlUsd", 0.0),
                "chain": p.get("chain", ""),
                "pool_id": p.get("pool", ""),
                "risk": "low" if p.get("tvlUsd", 0) > 10_000_000 else "medium",
            }
            for p in all_pools
            if p.get("chain", "").lower() == chain.lower()
            and p.get("tvlUsd", 0) >= min_tvl
            and p.get("apy", 0) >= min_apy
        ]
        filtered.sort(key=lambda x: x["apy"], reverse=True)
        top = filtered[:20]
        self._store("yields", top)
        return top

    @retry_with_backoff(max_retries=3, base_delay=2.0)
    def get_aave_polygon_yields(self) -> dict[str, float]:
        """Returns APY per token symbol for Aave V3 on Polygon."""
        cached = self._cached("aave_yields")
        if cached:
            return cached

        all_yields = self.get_defillama_yields()
        aave_yields: dict[str, float] = {}
        for pool in all_yields:
            if "aave" in pool["protocol"].lower():
                symbol = pool["token"].upper().replace("-", "_")
                # Map common variants
                for tok in config.TOKENS:
                    if tok in symbol or symbol in tok:
                        aave_yields[tok] = pool["apy"]
                        break
        self._store("aave_yields", aave_yields)
        return aave_yields

    # ── Market sentiment ───────────────────────────────────────────────────────

    @retry_with_backoff(max_retries=2, base_delay=2.0)
    def get_fear_greed_index(self) -> dict:
        cached = self._cached("fear_greed", ttl=3600)
        if cached:
            return cached
        try:
            resp = self._client.get("https://api.alternative.me/fng/?limit=1")
            resp.raise_for_status()
            data = resp.json()["data"][0]
            result = {
                "value": int(data["value"]),
                "label": data["value_classification"],
            }
        except Exception:
            result = {"value": 50, "label": "Neutral"}
        self._store("fear_greed", result)
        return result

    # ── Gas price ─────────────────────────────────────────────────────────────

    def get_gas_price_gwei(self, w3: Any | None = None) -> float:
        cached = self._cached("gas", ttl=60)
        if cached:
            return cached
        try:
            if w3:
                gwei = w3.eth.gas_price / 1e9
                self._store("gas", gwei)
                return gwei
        except Exception:
            pass
        try:
            resp = self._client.get("https://gasstation.polygon.technology/v2")
            resp.raise_for_status()
            data = resp.json()
            gwei = float(data.get("standard", {}).get("maxFee", 35))
        except Exception:
            gwei = 35.0
        self._store("gas", gwei)
        return gwei

    # ── Combined context builder ───────────────────────────────────────────────

    def build_market_snapshot(self, w3: Any | None = None) -> dict:
        prices = self.get_token_prices_usd()
        changes = self.get_price_changes_24h()
        fear_greed = self.get_fear_greed_index()
        gas_gwei = self.get_gas_price_gwei(w3)
        aave_yields = self.get_aave_polygon_yields()
        top_yields = self.get_defillama_yields()[:10]

        matic_price = prices.get("MATIC", 0.8)
        swap_cost_usd = (gas_gwei * 1e9 * 150_000) / 1e18 * matic_price

        return {
            "timestamp": now_iso(),
            "prices": prices,
            "price_changes_24h": changes,
            "fear_greed_index": fear_greed,
            "gas_price_gwei": gas_gwei,
            "estimated_swap_cost_usd": round(swap_cost_usd, 4),
            "aave_yields": aave_yields,
            "top_yield_opportunities": top_yields,
        }

    def close(self) -> None:
        self._client.close()
