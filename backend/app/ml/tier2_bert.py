from __future__ import annotations

from typing import Any


def analyze_context_text(text: str) -> dict[str, Any]:
    lowered = (text or "").lower()
    pressure_terms = ["urgent", "immediately", "verify", "password", "reset", "now"]
    hits = [term for term in pressure_terms if term in lowered]
    risk_boost = min(0.35, 0.08 * len(hits))

    if risk_boost >= 0.2:
        action = "FREEZE"
    elif risk_boost > 0.08:
        action = "NOTIFY"
    else:
        action = "APPROVE"

    return {
        "risk_boost": round(risk_boost, 4),
        "action": action,
        "matched_terms": hits,
        "explanation": "Contextual text analysis detected coercive or high-pressure language.",
    }
