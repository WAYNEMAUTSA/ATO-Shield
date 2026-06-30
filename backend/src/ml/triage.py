from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from backend.src.core.detector import score_transaction


class TriageEngine:
    def __init__(self, model_path: Path | None = None) -> None:
        self.model_path = model_path

    def evaluate(self, payload: dict[str, Any]) -> dict[str, Any]:
        verdict = score_transaction(payload, output_path=self.model_path)
        return {
            "risk_score": verdict["risk_score"],
            "action": verdict["action"],
            "category": verdict["category"],
            "model_type": verdict["model_type"],
            "explanation": verdict["explanation"],
        }
