from __future__ import annotations

from typing import Any


def choose_action(risk_score: float, description: str | None = None) -> dict[str, Any]:
    if risk_score < 0.3:
        return {"action": "APPROVE", "category": "safe"}
    if risk_score > 0.7:
        return {"action": "BLOCK", "category": "fraud"}
    if description and any(token in description.lower() for token in ["urgent", "verify", "password", "immediately"]):
        return {"action": "FREEZE", "category": "review"}
    return {"action": "NOTIFY", "category": "review"}
