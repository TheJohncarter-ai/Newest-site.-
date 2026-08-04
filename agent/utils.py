"""Logging, retry helpers, formatters, and custom exceptions."""

from __future__ import annotations

import functools
import logging
import time
from typing import Any, Callable, Type


# ── Custom exceptions ─────────────────────────────────────────────────────────

class AgentError(Exception):
    pass

class InsufficientFundsError(AgentError):
    pass

class RiskViolationError(AgentError):
    pass

class NetworkError(AgentError):
    pass

class DeFiError(AgentError):
    pass


# ── Logging setup ─────────────────────────────────────────────────────────────

def setup_logging(log_level: str = "INFO", log_file: str | None = None) -> logging.Logger:
    logger = logging.getLogger("crypto_agent")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    if logger.handlers:
        return logger

    fmt = logging.Formatter(
        "[%(asctime)s] %(levelname)-8s %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    if log_file:
        try:
            import os
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            fh = logging.FileHandler(log_file)
            fh.setFormatter(fmt)
            logger.addHandler(fh)
        except Exception:
            pass

    return logger


def get_logger(name: str = "crypto_agent") -> logging.Logger:
    return logging.getLogger(name)


# ── Unit converters ───────────────────────────────────────────────────────────

def wei_to_token(amount_wei: int, decimals: int) -> float:
    return amount_wei / (10 ** decimals)


def token_to_wei(amount: float, decimals: int) -> int:
    return int(amount * (10 ** decimals))


def ray_to_pct(ray: int) -> float:
    """Convert Aave ray (1e27) to percentage."""
    return (ray / 1e27) * 100


def format_usd(amount: float) -> str:
    return f"${amount:,.4f}"


def format_pct(pct: float) -> str:
    return f"{pct:.2f}%"


def truncate_address(addr: str) -> str:
    if len(addr) < 10:
        return addr
    return f"{addr[:6]}...{addr[-4:]}"


# ── Retry with exponential backoff ────────────────────────────────────────────

def retry_with_backoff(
    func: Callable | None = None,
    *,
    max_retries: int = 3,
    base_delay: float = 1.0,
    exceptions: tuple[Type[Exception], ...] = (Exception,),
) -> Any:
    """Decorator or direct wrapper with exponential backoff."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            logger = get_logger()
            last_exc: Exception | None = None
            for attempt in range(max_retries + 1):
                try:
                    return f(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
                    if attempt == max_retries:
                        break
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"{f.__name__} failed (attempt {attempt + 1}): {e}. Retrying in {delay}s...")
                    time.sleep(delay)
            raise NetworkError(f"{f.__name__} failed after {max_retries + 1} attempts") from last_exc
        return wrapper

    if func is not None:
        return decorator(func)
    return decorator


# ── Timestamp helpers ─────────────────────────────────────────────────────────

def now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def now_ts() -> float:
    return time.time()
