"""Wallet keypair management, balance queries, and transaction signing."""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

from web3 import Web3
from web3.exceptions import TransactionNotFound

from . import config
from .utils import (
    NetworkError,
    get_logger,
    retry_with_backoff,
    truncate_address,
    wei_to_token,
)

if TYPE_CHECKING:
    from eth_account.signers.local import LocalAccount

logger = get_logger()

UINT256_MAX = 2**256 - 1


class WalletManager:
    def __init__(self, w3: Web3) -> None:
        self.w3 = w3
        self._account: LocalAccount | None = None

    # ── Keypair management ────────────────────────────────────────────────────

    def create_new_wallet(self) -> dict:
        """Generate a new Polygon wallet. Prints and returns address + key."""
        from eth_account import Account
        acct = Account.create()
        logger.info(f"New wallet created: {acct.address}")
        logger.warning("SAVE YOUR PRIVATE KEY — it will not be shown again.")
        return {"address": acct.address, "private_key": acct.key.hex()}

    def load_wallet_from_env(self) -> "LocalAccount":
        """Load wallet from WALLET_PRIVATE_KEY env var."""
        from eth_account import Account
        key = os.environ.get("WALLET_PRIVATE_KEY", "")
        if not key:
            raise ValueError("WALLET_PRIVATE_KEY not set in environment")
        acct = Account.from_key(key)
        expected = os.environ.get("WALLET_ADDRESS", "")
        if expected and acct.address.lower() != expected.lower():
            raise ValueError(
                f"WALLET_ADDRESS mismatch: expected {expected}, got {acct.address}"
            )
        self._account = acct
        logger.info(f"Wallet loaded: {truncate_address(acct.address)}")
        return acct

    def get_wallet_address(self) -> str:
        if self._account is None:
            raise RuntimeError("Wallet not loaded. Call load_wallet_from_env() first.")
        return self._account.address

    # ── Balance queries ───────────────────────────────────────────────────────

    @retry_with_backoff(max_retries=3, base_delay=1.0)
    def get_matic_balance(self) -> float:
        addr = self.get_wallet_address()
        balance_wei = self.w3.eth.get_balance(addr)
        return wei_to_token(balance_wei, 18)

    @retry_with_backoff(max_retries=3, base_delay=1.0)
    def get_token_balance(self, token_symbol: str) -> float:
        token_info = config.TOKENS.get(token_symbol)
        if not token_info or token_info.get("is_native"):
            return self.get_matic_balance()
        contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(token_info["address"]),
            abi=config.ERC20_ABI,
        )
        addr = self.get_wallet_address()
        balance_wei = contract.functions.balanceOf(addr).call()
        return wei_to_token(balance_wei, token_info["decimals"])

    def get_all_balances(self) -> dict[str, float]:
        balances: dict[str, float] = {}
        for symbol in config.TOKENS:
            try:
                balances[symbol] = self.get_token_balance(symbol)
            except Exception as e:
                logger.warning(f"Could not fetch balance for {symbol}: {e}")
                balances[symbol] = 0.0
        return balances

    def get_portfolio_value_usd(self, balances: dict[str, float], prices: dict[str, float]) -> float:
        total = 0.0
        for symbol, amount in balances.items():
            price = prices.get(symbol, 0.0)
            total += amount * price
        return total

    # ── Transaction helpers ───────────────────────────────────────────────────

    def get_nonce(self) -> int:
        addr = self.get_wallet_address()
        return self.w3.eth.get_transaction_count(addr, "pending")

    def get_gas_price_wei(self) -> int:
        try:
            return self.w3.eth.gas_price
        except Exception:
            return Web3.to_wei(35, "gwei")

    def estimate_gas_cost_usd(self, gas_units: int, matic_price_usd: float) -> float:
        gas_price_wei = self.get_gas_price_wei()
        cost_matic = (gas_units * gas_price_wei) / 1e18
        return cost_matic * matic_price_usd

    def sign_and_send_transaction(self, tx_dict: dict, dry_run: bool = False) -> str:
        if self._account is None:
            raise RuntimeError("Wallet not loaded.")

        if "gas" not in tx_dict:
            try:
                tx_dict["gas"] = int(self.w3.eth.estimate_gas(tx_dict) * 1.2)
            except Exception as e:
                logger.warning(f"Gas estimation failed: {e}. Using 200000 as fallback.")
                tx_dict["gas"] = 200_000

        if "gasPrice" not in tx_dict and "maxFeePerGas" not in tx_dict:
            tx_dict["gasPrice"] = self.get_gas_price_wei()

        if "nonce" not in tx_dict:
            tx_dict["nonce"] = self.get_nonce()

        if dry_run:
            logger.info(f"[DRY RUN] Would send tx: to={tx_dict.get('to')}, gas={tx_dict.get('gas')}")
            return "0xdry_run_no_tx"

        signed = self._account.sign_transaction(tx_dict)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        hex_hash = tx_hash.hex()
        logger.info(f"Tx sent: {hex_hash}")
        return hex_hash

    @retry_with_backoff(max_retries=20, base_delay=3.0, exceptions=(TransactionNotFound, Exception))
    def wait_for_receipt(self, tx_hash: str, timeout: int = 120) -> dict:
        import time
        start = time.time()
        while time.time() - start < timeout:
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                if receipt is not None:
                    if receipt["status"] == 0:
                        raise DeFiError(f"Transaction {tx_hash} reverted on-chain")
                    logger.info(
                        f"Tx confirmed in block {receipt['blockNumber']}: "
                        f"gas used {receipt['gasUsed']}"
                    )
                    return dict(receipt)
            except Exception:
                pass
            time.sleep(3)
        raise NetworkError(f"Tx {tx_hash} not confirmed within {timeout}s")


from .utils import DeFiError  # noqa: E402 — avoid circular at top
