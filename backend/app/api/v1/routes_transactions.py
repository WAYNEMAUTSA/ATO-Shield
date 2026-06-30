from __future__ import annotations

from fastapi import APIRouter, status

from backend.app.core.config import settings
from backend.app.ml.tier2_bert import analyze_context_text
from backend.app.models.schemas import TransactionRequest, TransactionResponse
from backend.app.services.mitigation import choose_action
from backend.app.services.notifications import dispatch_notification
from backend.app.services.session_revoke import revoke_sessions
from backend.app.websocket.dashboard_ws import DashboardConnectionManager
from backend.src.core.detector import score_transaction, train_ieee_dataset_model

router = APIRouter(prefix="/api/v1", tags=["transactions"])
manager = DashboardConnectionManager()


@router.post("/transactions/score", response_model=TransactionResponse, status_code=status.HTTP_200_OK)
async def score_transaction_endpoint(payload: TransactionRequest) -> TransactionResponse:
    verdict = score_transaction(payload.model_dump())
    mitigation = choose_action(verdict["risk_score"], payload.description)

    context_result = analyze_context_text(payload.description)
    if verdict["risk_score"] >= settings.tier1_green_threshold and verdict["risk_score"] <= settings.tier1_red_threshold:
        verdict["risk_score"] = min(1.0, verdict["risk_score"] + context_result["risk_boost"])
        mitigation = choose_action(verdict["risk_score"], payload.description)

    notification = dispatch_notification(mitigation["action"], payload.user_id)
    session_result = revoke_sessions(payload.user_id) if mitigation["action"] == "BLOCK" else {"status": "kept"}

    event = {
        "event": "transaction_decision",
        "user_id": payload.user_id,
        "risk_score": verdict["risk_score"],
        "action": mitigation["action"],
        "category": mitigation["category"],
        "notification": notification,
        "session": session_result,
    }
    await manager.broadcast(event)

    return TransactionResponse(
        user_id=payload.user_id,
        merchant=payload.merchant,
        amount=payload.amount,
        device_id=payload.device_id,
        country=payload.country,
        currency=payload.currency,
        description=payload.description,
        risk_score=verdict["risk_score"],
        action=mitigation["action"],
        category=mitigation["category"],
        explanation=verdict["explanation"],
    )


@router.post("/admin/retrain", status_code=status.HTTP_200_OK)
async def retrain_model() -> dict[str, object]:
    metadata = train_ieee_dataset_model(settings.ieee_dataset_path or "")
    return {"status": "ok", "model_type": metadata["model_type"], "dataset_source": metadata.get("dataset_source", "unknown")}


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
