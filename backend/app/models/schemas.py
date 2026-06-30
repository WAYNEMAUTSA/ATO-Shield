from datetime import datetime

from pydantic import BaseModel, Field


class TransactionIn(BaseModel):
    user_id: str
    amount: float
    currency: str = "USD"

    location_lat: float | None = None
    location_lon: float | None = None

    device_id: str | None = None
    network_fingerprint: str | None = None
    merchant_category: str | None = None

    description: str | None = Field(default=None, description="Transfer memo or note text")


class VerdictOut(BaseModel):
    tier1_score: float
    tier2_score: float | None
    zone: str
    final_risk_score: float
    action: str

    model_config = {"from_attributes": True}


class TransactionOut(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    description: str | None
    created_at: datetime
    verdict: VerdictOut | None

    model_config = {"from_attributes": True}
