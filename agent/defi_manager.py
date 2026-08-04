"""DeFi protocol interactions: Aave V3 and DEX swaps (1inch + Uniswap V3)."""

from __future__ import annotations

import os
import time
from typing import Any

import httpx
from web3 import Web3

from . import config
from .utils import (
    DeFiError,
    InsufficientFundsError,
    NetworkError,
    get_logger,
    ray_to_pct,
    retry_with_backoff,
    token_to_wei,
    wei_to_token,
)
from .wallet import WalletManager

logger = get_logger()

UINT256_MAX = 2**256 - 1


class DeFiManager:
    def __init__(self, w3: Web3, wallet: WalletManager) -> None:
        self.w3 = w3
        self.wallet = wallet
        self._http = httpx.Client(timeout=20.0)

        self._aave_pool = w3.eth.contract(
            address=Web3.to_checksum_address(config.AAVE_V3_POOL),
            abi=config.AAVE_V3_POOL_ABI,
        )
        self._aave_data = w3.eth.contract(
            address=Web3.to_checksum_address(config.AAVE_V3_DATA_PROVIDER),
            abi=config.AAVE_V3_DATA_PROVIDER_ABI,
        )
        self._uni_router = w3.eth.contract(
            address=Web3.to_checksum_address(config.UNISWAP_V3_ROUTER),
            abi=config.UNISWAP_V3_ROUTER_ABI,
        )
        self._uni_quoter = w3.eth.contract(
            address=Web3.to_checksum_address(config.UNISWAP_V3_QUOTER),
            abi=config.UNISWAP_V3_QUOTER_ABI,
        )

    def _token_contract(self, symbol: str) -> Any:
        addr = config.TOKENS[symbol]["address"]
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(addr),
            abi=config.ERC20_ABI,
        )

    # ── Token approval ─────────────────────────────────────────────────────────

    def get_allowance(self, token_symbol: str, spender_address: str) -> int:
        contract = self._token_contract(token_symbol)
        return contract.functions.allowance(
            self.wallet.get_wallet_address(),
            Web3.to_checksum_address(spender_address),
        ).call()

    def ensure_approval(
        self,
        token_symbol: str,
        spender_address: str,
        amount_wei: int,
        dry_run: bool = False,
    ) -> str | None:
        current = self.get_allowance(token_symbol, spender_address)
        if current >= amount_wei:
            return None  # already approved

        contract = self._token_contract(token_symbol)
        tx = contract.functions.approve(
            Web3.to_checksum_address(spender_address), UINT256_MAX
        ).build_transaction({
            "from": self.wallet.get_wallet_address(),
            "chainId": config.CHAIN_ID,
        })
        logger.info(f"Approving {token_symbol} for {spender_address[:8]}...")
        tx_hash = self.wallet.sign_and_send_transaction(tx, dry_run=dry_run)
        if not dry_run:
            self.wallet.wait_for_receipt(tx_hash)
        return tx_hash

    # ── Aave V3 ────────────────────────────────────────────────────────────────

    def aave_supply(
        self,
        token_symbol: str,
        amount: float,
        dry_run: bool = False,
    ) -> str:
        token_info = config.TOKENS[token_symbol]
        amount_wei = token_to_wei(amount, token_info["decimals"])
        addr = self.wallet.get_wallet_address()

        logger.info(f"Aave supply: {amount} {token_symbol}")
        self.ensure_approval(token_symbol, config.AAVE_V3_POOL, amount_wei, dry_run=dry_run)

        tx = self._aave_pool.functions.supply(
            Web3.to_checksum_address(token_info["address"]),
            amount_wei,
            addr,
            0,  # referral code
        ).build_transaction({
            "from": addr,
            "chainId": config.CHAIN_ID,
        })
        tx_hash = self.wallet.sign_and_send_transaction(tx, dry_run=dry_run)
        if not dry_run:
            self.wallet.wait_for_receipt(tx_hash)
            logger.info(f"Aave supply confirmed: {amount} {token_symbol}")
        return tx_hash

    def aave_withdraw(
        self,
        token_symbol: str,
        amount: float | None = None,  # None = withdraw all
        dry_run: bool = False,
    ) -> str:
        token_info = config.TOKENS[token_symbol]
        addr = self.wallet.get_wallet_address()
        amount_wei = UINT256_MAX if amount is None else token_to_wei(amount, token_info["decimals"])

        logger.info(f"Aave withdraw: {'ALL' if amount is None else amount} {token_symbol}")
        tx = self._aave_pool.functions.withdraw(
            Web3.to_checksum_address(token_info["address"]),
            amount_wei,
            addr,
        ).build_transaction({
            "from": addr,
            "chainId": config.CHAIN_ID,
        })
        tx_hash = self.wallet.sign_and_send_transaction(tx, dry_run=dry_run)
        if not dry_run:
            self.wallet.wait_for_receipt(tx_hash)
            logger.info(f"Aave withdraw confirmed: {token_symbol}")
        return tx_hash

    def get_aave_position(self, token_symbol: str, prices: dict[str, float]) -> dict:
        token_info = config.TOKENS.get(token_symbol, {})
        if not token_info or token_info.get("is_native"):
            return {"supplied": 0.0, "supplied_usd": 0.0, "apy": 0.0}
        try:
            reserve = self._aave_data.functions.getUserReserveData(
                Web3.to_checksum_address(token_info["address"]),
                self.wallet.get_wallet_address(),
            ).call()
            supplied = wei_to_token(reserve[0], token_info["decimals"])
            price = prices.get(token_symbol, 1.0)

            # Get current APY from reserve data
            res_data = self._aave_data.functions.getReserveData(
                Web3.to_checksum_address(token_info["address"])
            ).call()
            apy = ray_to_pct(res_data[5])  # liquidityRate field

            return {
                "supplied": supplied,
                "supplied_usd": supplied * price,
                "apy": round(apy, 2),
            }
        except Exception as e:
            logger.warning(f"Could not fetch Aave position for {token_symbol}: {e}")
            return {"supplied": 0.0, "supplied_usd": 0.0, "apy": 0.0}

    def get_all_aave_positions(self, prices: dict[str, float]) -> dict:
        positions: dict[str, dict] = {}
        for symbol in config.STABLECOINS:
            pos = self.get_aave_position(symbol, prices)
            if pos["supplied"] > 0:
                positions[symbol] = pos
        return positions

    def get_aave_account_data(self) -> dict:
        try:
            data = self._aave_pool.functions.getUserAccountData(
                self.wallet.get_wallet_address()
            ).call()
            return {
                "total_collateral_usd": data[0] / 1e8,
                "total_debt_usd": data[1] / 1e8,
                "available_borrows_usd": data[2] / 1e8,
                "health_factor": data[5] / 1e18 if data[5] < 2**128 else 999,
            }
        except Exception as e:
            logger.warning(f"Could not fetch Aave account data: {e}")
            return {}

    # ── 1inch swap (better for small amounts) ─────────────────────────────────

    def oneinch_quote(
        self,
        from_symbol: str,
        to_symbol: str,
        amount_wei: int,
    ) -> dict | None:
        api_key = os.environ.get("ONEINCH_API_KEY", "")
        if not api_key:
            return None

        from_addr = config.TOKENS[from_symbol]["address"]
        to_addr = config.TOKENS[to_symbol]["address"]
        url = f"{config.ONEINCH_API_BASE}/quote"
        params = {"src": from_addr, "dst": to_addr, "amount": str(amount_wei)}
        headers = {"Authorization": f"Bearer {api_key}"}
        try:
            resp = self._http.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return {
                "to_amount_wei": int(data.get("toAmount", 0)),
                "estimated_gas": int(data.get("gas", 200_000)),
            }
        except Exception as e:
            logger.warning(f"1inch quote failed: {e}")
            return None

    def oneinch_swap(
        self,
        from_symbol: str,
        to_symbol: str,
        amount_wei: int,
        slippage_pct: float = 1.0,
        dry_run: bool = False,
    ) -> str:
        api_key = os.environ.get("ONEINCH_API_KEY", "")
        if not api_key:
            raise DeFiError("ONEINCH_API_KEY not set")

        from_addr = config.TOKENS[from_symbol]["address"]
        to_addr = config.TOKENS[to_symbol]["address"]
        wallet_addr = self.wallet.get_wallet_address()

        self.ensure_approval(from_symbol, config.ONEINCH_ROUTER, amount_wei, dry_run=dry_run)

        url = f"{config.ONEINCH_API_BASE}/swap"
        params = {
            "src": from_addr,
            "dst": to_addr,
            "amount": str(amount_wei),
            "from": wallet_addr,
            "slippage": slippage_pct,
            "disableEstimate": "false",
        }
        headers = {"Authorization": f"Bearer {api_key}"}
        resp = self._http.get(url, params=params, headers=headers)
        resp.raise_for_status()
        swap_data = resp.json()

        tx_data = swap_data.get("tx", {})
        tx = {
            "to": Web3.to_checksum_address(tx_data["to"]),
            "data": tx_data["data"],
            "value": int(tx_data.get("value", 0)),
            "gas": int(tx_data.get("gas", 300_000)),
            "from": wallet_addr,
            "chainId": config.CHAIN_ID,
        }
        logger.info(f"1inch swap: {from_symbol} → {to_symbol}")
        tx_hash = self.wallet.sign_and_send_transaction(tx, dry_run=dry_run)
        if not dry_run:
            self.wallet.wait_for_receipt(tx_hash)
            logger.info(f"1inch swap confirmed: {from_symbol} → {to_symbol}")
        return tx_hash

    # ── Uniswap V3 (fallback / larger amounts) ────────────────────────────────

    def uniswap_quote(
        self,
        from_symbol: str,
        to_symbol: str,
        amount_wei: int,
        fee_tier: int = 500,
    ) -> int | None:
        from_addr = Web3.to_checksum_address(config.TOKENS[from_symbol]["address"])
        to_addr = Web3.to_checksum_address(config.TOKENS[to_symbol]["address"])
        try:
            result = self._uni_quoter.functions.quoteExactInputSingle(
                (from_addr, to_addr, amount_wei, fee_tier, 0)
            ).call()
            return result[0]
        except Exception as e:
            logger.warning(f"Uniswap quote failed: {e}")
            return None

    def uniswap_swap(
        self,
        from_symbol: str,
        to_symbol: str,
        amount_wei: int,
        min_amount_out_wei: int,
        fee_tier: int = 500,
        dry_run: bool = False,
    ) -> str:
        from_addr = Web3.to_checksum_address(config.TOKENS[from_symbol]["address"])
        to_addr = Web3.to_checksum_address(config.TOKENS[to_symbol]["address"])
        wallet_addr = self.wallet.get_wallet_address()
        deadline = int(time.time()) + 300

        self.ensure_approval(from_symbol, config.UNISWAP_V3_ROUTER, amount_wei, dry_run=dry_run)

        tx = self._uni_router.functions.exactInputSingle((
            from_addr, to_addr, fee_tier, wallet_addr,
            amount_wei, min_amount_out_wei, 0,
        )).build_transaction({
            "from": wallet_addr,
            "chainId": config.CHAIN_ID,
            "value": 0,
        })
        logger.info(f"Uniswap swap: {from_symbol} → {to_symbol}")
        tx_hash = self.wallet.sign_and_send_transaction(tx, dry_run=dry_run)
        if not dry_run:
            self.wallet.wait_for_receipt(tx_hash)
            logger.info(f"Uniswap swap confirmed: {from_symbol} → {to_symbol}")
        return tx_hash

    # ── Combined position view ─────────────────────────────────────────────────

    def get_all_defi_positions(self, prices: dict[str, float]) -> dict:
        return {"aave": self.get_all_aave_positions(prices)}

    def close(self) -> None:
        self._http.close()
