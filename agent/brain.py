"""
Claude AI integration — structured decision making via tool-use.
Receives market context, returns validated action plan JSON.
"""

from __future__ import annotations

import json
import os
from typing import Any

import anthropic

from .utils import get_logger

logger = get_logger()

EXECUTE_TRADES_TOOL: dict = {
    "name": "execute_trades",
    "description": (
        "Submit your action plan for the current cycle. "
        "Call this exactly once with your recommended actions (empty list = hold). "
        "Max 3 actions per cycle."
    ),
    "input_schema": {
        "type": "object",
        "required": ["reasoning", "market_assessment", "actions", "next_cycle_watch"],
        "properties": {
            "reasoning": {
                "type": "string",
                "description": "2-3 sentences explaining current conditions and why these actions were chosen.",
            },
            "market_assessment": {
                "type": "object",
                "required": ["overall_sentiment", "risk_level", "best_opportunity"],
                "properties": {
                    "overall_sentiment": {
                        "type": "string",
                        "enum": ["very_bullish", "bullish", "neutral", "bearish", "very_bearish"],
                    },
                    "risk_level": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "extreme"],
                    },
                    "best_opportunity": {"type": "string"},
                },
            },
            "actions": {
                "type": "array",
                "maxItems": 3,
                "items": {
                    "type": "object",
                    "required": ["type", "priority", "rationale"],
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["aave_supply", "aave_withdraw", "swap", "hold"],
                        },
                        "priority": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 3,
                            "description": "1=highest priority",
                        },
                        "token": {
                            "type": "string",
                            "description": "Token symbol for aave_supply or aave_withdraw (e.g. USDC)",
                        },
                        "token_in": {
                            "type": "string",
                            "description": "Source token for swap",
                        },
                        "token_out": {
                            "type": "string",
                            "description": "Destination token for swap",
                        },
                        "amount_pct_of_holding": {
                            "type": "number",
                            "minimum": 0.01,
                            "maximum": 1.0,
                            "description": "Fraction of held token to use (0.9 = 90%)",
                        },
                        "amount_pct": {
                            "type": "number",
                            "minimum": 0.01,
                            "maximum": 0.20,
                            "description": "Fraction of total portfolio value to use",
                        },
                        "rationale": {
                            "type": "string",
                            "description": "One sentence explaining this specific action.",
                        },
                    },
                },
            },
            "next_cycle_watch": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of 2-3 things to monitor in the next cycle.",
            },
        },
    },
}

SYSTEM_PROMPT = """You are an autonomous DeFi trading agent managing a crypto portfolio on Polygon.
Your goal is to GROW the portfolio starting from $10 USD while strictly preserving capital.

## Strategy Rules (the risk manager will also enforce these — do not try to circumvent them)

**Tier 1 ($0–$20 portfolio):**
- ONLY deposit USDC or DAI into Aave V3 to earn yield (~4–6% APY)
- NO swaps, NO volatile assets, NO speculation
- Every USDC sitting idle is losing value — deposit it to Aave

**Tier 2 ($20–$100 portfolio):**
- Up to 10% of portfolio may go into volatile assets (WETH, WMATIC)
- Max 20% in any single position
- Always maintain ≥ 30% stablecoins

**Tier 3 ($100+ portfolio):**
- Up to 20% per volatile position
- Can consider LP positions and more active strategies

## Universal Rules
- ALWAYS keep ≥ 30% stablecoins
- ALWAYS keep ≥ 2 MATIC in wallet for gas
- Gas per swap ≈ $0.002. Only trade if the expected return is at least 3× gas cost
- If gas cost > 10% of trade value, DO NOT trade — it destroys value
- Stop-loss is automatic at -15%. Don't over-ride it
- If Fear & Greed < 20 (extreme fear): reduce volatile exposure, wait
- If Fear & Greed > 80 (extreme greed): don't chase; wait for pullback

## Output Format
You MUST call the execute_trades tool exactly once.
If no action is needed this cycle, call it with an empty actions list and explain why in reasoning.
Be conservative — "hold" is often the right answer for small portfolios."""


class AgentBrain:
    def __init__(self) -> None:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-6"

    def analyze_and_decide(self, context: dict) -> dict:
        """Send market context to Claude, get back a validated action plan."""
        context_json = json.dumps(context, indent=2)

        logger.info(f"Sending context to Claude ({len(context_json)} chars)...")
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                tools=[EXECUTE_TRADES_TOOL],
                tool_choice={"type": "auto"},
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Here is the current portfolio and market state. "
                            f"Analyze it and call execute_trades with your action plan.\n\n"
                            f"```json\n{context_json}\n```"
                        ),
                    }
                ],
            )
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {e}")
            raise

        return self._parse_response(message)

    def _parse_response(self, message: anthropic.types.Message) -> dict:
        for block in message.content:
            if block.type == "tool_use" and block.name == "execute_trades":
                plan = block.input
                plan["actions"] = self._sanitize_actions(plan.get("actions", []))
                logger.info(
                    f"Claude decision: {len(plan['actions'])} action(s) | "
                    f"sentiment={plan.get('market_assessment', {}).get('overall_sentiment')} | "
                    f"reasoning={plan.get('reasoning', '')[:120]}..."
                )
                return plan

        logger.warning("Claude did not call execute_trades — defaulting to hold")
        return {
            "reasoning": "No tool call received from Claude — holding this cycle.",
            "market_assessment": {
                "overall_sentiment": "neutral",
                "risk_level": "medium",
                "best_opportunity": "unknown",
            },
            "actions": [],
            "next_cycle_watch": ["Claude API response"],
        }

    def _sanitize_actions(self, actions: list) -> list:
        """Filter out any unrecognised action types and enforce max 3."""
        valid_types = {"aave_supply", "aave_withdraw", "swap", "hold"}
        clean = [a for a in actions if isinstance(a, dict) and a.get("type") in valid_types]
        return clean[:3]
