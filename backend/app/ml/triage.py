from __future__ import annotations

from typing import Any

from backend.src.core.detector import score_transaction


class TriageEngine:
    def evaluate(self, payload: dict[str, Any]) -> dict[str, Any]:
        return score_transaction(payload)
