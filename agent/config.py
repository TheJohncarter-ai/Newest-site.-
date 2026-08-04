"""
Configuration, contract addresses, ABIs, and risk parameters.
Never put secrets here — those live in .env.
"""

from __future__ import annotations

# ── Network ─────────────────────────────────────────────────────────────────

CHAIN_ID = 137  # Polygon mainnet
BLOCK_EXPLORER = "https://polygonscan.com"

# ── Token addresses (Polygon, checksummed) ───────────────────────────────────

TOKENS: dict[str, dict] = {
    "MATIC": {
        "address": "0x0000000000000000000000000000000000001010",
        "decimals": 18,
        "is_native": True,
        "coingecko_id": "matic-network",
    },
    "WMATIC": {
        "address": "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        "decimals": 18,
        "is_native": False,
        "coingecko_id": "matic-network",
    },
    "USDC": {
        "address": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",  # native USDC
        "decimals": 6,
        "is_native": False,
        "coingecko_id": "usd-coin",
        "is_stable": True,
    },
    "USDC_E": {
        "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",  # USDC.e (bridged)
        "decimals": 6,
        "is_native": False,
        "coingecko_id": "usd-coin",
        "is_stable": True,
    },
    "USDT": {
        "address": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        "decimals": 6,
        "is_native": False,
        "coingecko_id": "tether",
        "is_stable": True,
    },
    "DAI": {
        "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        "decimals": 18,
        "is_native": False,
        "coingecko_id": "dai",
        "is_stable": True,
    },
    "WETH": {
        "address": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "decimals": 18,
        "is_native": False,
        "coingecko_id": "ethereum",
    },
    "WBTC": {
        "address": "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
        "decimals": 8,
        "is_native": False,
        "coingecko_id": "wrapped-bitcoin",
    },
}

STABLECOINS = {k for k, v in TOKENS.items() if v.get("is_stable")}
TOKEN_BY_ADDRESS = {v["address"].lower(): k for k, v in TOKENS.items() if not v.get("is_native")}

# ── Protocol addresses ────────────────────────────────────────────────────────

AAVE_V3_POOL = "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
AAVE_V3_DATA_PROVIDER = "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654"
AAVE_V3_ADDRESSES_PROVIDER = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"

UNISWAP_V3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"   # SwapRouter02
UNISWAP_V3_QUOTER = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e"    # QuoterV2

ONEINCH_ROUTER = "0x1111111254EEB25477B68fb85Ed929f73A960582"
ONEINCH_API_BASE = "https://api.1inch.dev/swap/v6.0/137"

# ── Strategy thresholds ────────────────────────────────────────────────────────

TIER_1_MAX_USD = 20.0    # stable yield only
TIER_2_MAX_USD = 100.0   # small speculative positions allowed

# ── Risk parameters ────────────────────────────────────────────────────────────

MAX_SINGLE_POSITION_PCT = 0.20   # max 20% in one volatile asset
MIN_STABLECOIN_PCT = 0.30        # always keep ≥ 30% stablecoins
STOP_LOSS_PCT = 0.15             # exit if position drops 15% from entry
MAX_DRAWDOWN_PCT = 0.30          # emergency liquidation trigger
GAS_RESERVE_MATIC = 2.0          # always keep ≥ 2 MATIC for gas
MAX_GAS_COST_RATIO = 0.10        # reject trade if gas > 10% of trade value

# ── Timing ─────────────────────────────────────────────────────────────────────

DECISION_INTERVAL_SECONDS = 1800  # 30-minute main cycle
STOP_LOSS_POLL_SECONDS = 60       # stop-loss checked every 60s
MARKET_DATA_CACHE_TTL = 300       # 5-minute cache for API data

# ── Slippage tolerances ────────────────────────────────────────────────────────

SLIPPAGE_STABLE_STABLE = 0.005   # 0.5% for stable/stable pairs
SLIPPAGE_MATIC_STABLE = 0.01     # 1.0% for MATIC/stable
SLIPPAGE_VOLATILE = 0.02         # 2.0% for volatile pairs

# ── Minimal ABIs ──────────────────────────────────────────────────────────────

ERC20_ABI = [
    {"name": "balanceOf", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "account", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}]},
    {"name": "allowance", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
     "outputs": [{"name": "", "type": "uint256"}]},
    {"name": "approve", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "outputs": [{"name": "", "type": "bool"}]},
    {"name": "decimals", "type": "function", "stateMutability": "view",
     "inputs": [], "outputs": [{"name": "", "type": "uint8"}]},
    {"name": "symbol", "type": "function", "stateMutability": "view",
     "inputs": [], "outputs": [{"name": "", "type": "string"}]},
]

AAVE_V3_POOL_ABI = [
    {"name": "supply", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "asset", "type": "address"}, {"name": "amount", "type": "uint256"},
                {"name": "onBehalfOf", "type": "address"}, {"name": "referralCode", "type": "uint16"}],
     "outputs": []},
    {"name": "withdraw", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "asset", "type": "address"}, {"name": "amount", "type": "uint256"},
                {"name": "to", "type": "address"}],
     "outputs": [{"name": "", "type": "uint256"}]},
    {"name": "getUserAccountData", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "user", "type": "address"}],
     "outputs": [
         {"name": "totalCollateralBase", "type": "uint256"},
         {"name": "totalDebtBase", "type": "uint256"},
         {"name": "availableBorrowsBase", "type": "uint256"},
         {"name": "currentLiquidationThreshold", "type": "uint256"},
         {"name": "ltv", "type": "uint256"},
         {"name": "healthFactor", "type": "uint256"},
     ]},
]

AAVE_V3_DATA_PROVIDER_ABI = [
    {"name": "getUserReserveData", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "asset", "type": "address"}, {"name": "user", "type": "address"}],
     "outputs": [
         {"name": "currentATokenBalance", "type": "uint256"},
         {"name": "currentStableDebt", "type": "uint256"},
         {"name": "currentVariableDebt", "type": "uint256"},
         {"name": "principalStableDebt", "type": "uint256"},
         {"name": "scaledVariableDebt", "type": "uint256"},
         {"name": "stableBorrowRate", "type": "uint256"},
         {"name": "liquidityRate", "type": "uint256"},
         {"name": "stableRateLastUpdated", "type": "uint40"},
         {"name": "usageAsCollateralEnabled", "type": "bool"},
     ]},
    {"name": "getReserveData", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "asset", "type": "address"}],
     "outputs": [
         {"name": "unbacked", "type": "uint256"},
         {"name": "accruedToTreasuryScaled", "type": "uint256"},
         {"name": "totalAToken", "type": "uint256"},
         {"name": "totalStableDebt", "type": "uint256"},
         {"name": "totalVariableDebt", "type": "uint256"},
         {"name": "liquidityRate", "type": "uint256"},
         {"name": "variableBorrowRate", "type": "uint256"},
         {"name": "stableBorrowRate", "type": "uint256"},
         {"name": "averageStableBorrowRate", "type": "uint256"},
         {"name": "liquidityIndex", "type": "uint256"},
         {"name": "variableBorrowIndex", "type": "uint256"},
         {"name": "lastUpdateTimestamp", "type": "uint40"},
     ]},
]

UNISWAP_V3_ROUTER_ABI = [
    {"name": "exactInputSingle", "type": "function", "stateMutability": "payable",
     "inputs": [{"name": "params", "type": "tuple",
                 "components": [
                     {"name": "tokenIn", "type": "address"},
                     {"name": "tokenOut", "type": "address"},
                     {"name": "fee", "type": "uint24"},
                     {"name": "recipient", "type": "address"},
                     {"name": "amountIn", "type": "uint256"},
                     {"name": "amountOutMinimum", "type": "uint256"},
                     {"name": "sqrtPriceLimitX96", "type": "uint160"},
                 ]}],
     "outputs": [{"name": "amountOut", "type": "uint256"}]},
]

UNISWAP_V3_QUOTER_ABI = [
    {"name": "quoteExactInputSingle", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "params", "type": "tuple",
                 "components": [
                     {"name": "tokenIn", "type": "address"},
                     {"name": "tokenOut", "type": "address"},
                     {"name": "amountIn", "type": "uint256"},
                     {"name": "fee", "type": "uint24"},
                     {"name": "sqrtPriceLimitX96", "type": "uint160"},
                 ]}],
     "outputs": [
         {"name": "amountOut", "type": "uint256"},
         {"name": "sqrtPriceX96After", "type": "uint160"},
         {"name": "initializedTicksCrossed", "type": "uint32"},
         {"name": "gasEstimate", "type": "uint256"},
     ]},
]
