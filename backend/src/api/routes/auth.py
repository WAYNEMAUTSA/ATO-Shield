from __future__ import annotations

from fastapi import APIRouter, status

from backend.src.core.detector import score_transaction
from backend.src.core.rules import build_context, resolve_action
from backend.src.models.schemas import TransactionRequest, TransactionResponse

router = APIRouter(prefix="/api/v1", tags=["transactions"])


@router.post("/transactions/score", response_model=TransactionResponse, status_code=status.HTTP_200_OK)
async def score_transaction_endpoint(payload: TransactionRequest) -> TransactionResponse:
    verdict = score_transaction(payload.model_dump())
    context = build_context(payload.model_dump())
    action, category = resolve_action(verdict["risk_score"])

    if action == "BLOCK" and context["contains_urgent_language"]:
        verdict["explanation"] = "Urgent language and elevated risk triggered a block recommendation."

    return TransactionResponse(
        user_id=payload.user_id,
        merchant=payload.merchant,
        amount=payload.amount,
        device_id=payload.device_id,
        country=payload.country,
        currency=payload.currency,
        description=payload.description,
        risk_score=verdict["risk_score"],
        action=action,
        category=category,
        explanation=verdict["explanation"],
    )


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
