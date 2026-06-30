from __future__ import annotations

from pydantic import BaseModel, Field


class TransactionRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    merchant: str = Field(..., min_length=1)
    amount: float = Field(..., ge=0)
    device_id: str = Field(..., min_length=1)
    country: str = Field(..., min_length=2, max_length=2)
    description: str = Field(default="")


class TransactionResponse(BaseModel):
    user_id: str
    merchant: str
    amount: float
    device_id: str
    country: str
    description: str
    risk_score: float
    action: str
    category: str
    explanation: str


class VerdictRecord(BaseModel):
    transaction_id: int
    risk_score: float
    action: str
    category: str
    reason: str | None = None
