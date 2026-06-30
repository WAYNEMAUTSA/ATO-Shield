from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    tier1_green_threshold: float = 0.30
    tier1_red_threshold: float = 0.70
    ieee_dataset_path: str | None = None


settings = Settings(
    tier1_green_threshold=float(os.getenv("TIER1_GREEN_THRESHOLD", "0.30")),
    tier1_red_threshold=float(os.getenv("TIER1_RED_THRESHOLD", "0.70")),
    ieee_dataset_path=os.getenv("IEEE_DATASET_PATH"),
)
