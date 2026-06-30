from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "ATO-Shield"
    env: str = "dev"
    tier1_green_threshold: float = 0.30
    tier1_red_threshold: float = 0.70
    ieee_dataset_path: str | None = None


settings = Settings(
    app_name=os.getenv("APP_NAME", "ATO-Shield"),
    env=os.getenv("ENV", "dev"),
    tier1_green_threshold=float(os.getenv("TIER1_GREEN_THRESHOLD", "0.30")),
    tier1_red_threshold=float(os.getenv("TIER1_RED_THRESHOLD", "0.70")),
    ieee_dataset_path=os.getenv("IEEE_DATASET_PATH"),
)
