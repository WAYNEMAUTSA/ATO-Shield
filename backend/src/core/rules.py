from __future__ import annotations

from typing import Any


def resolve_action(score: float) -> tuple[str, str]:
    if score < 0.3:
        return "APPROVE", "safe"
    if score > 0.7:
        return "BLOCK", "fraud"
    return "NOTIFY", "review"


def build_context(payload: dict[str, Any]) -> dict[str, Any]:
    description = str(payload.get("description", "")).lower()
    return {
        "contains_urgent_language": any(token in description for token in ["urgent", "immediately", "verify", "password"]),
        "amount": float(payload.get("amount", 0.0)),
        "merchant": str(payload.get("merchant", "unknown")).lower(),
    }
