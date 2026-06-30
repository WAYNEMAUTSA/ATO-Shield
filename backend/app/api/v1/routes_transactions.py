from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.schemas import TransactionIn, TransactionOut, VerdictOut
from app.models.db_models import Transaction, Verdict
from app.api.v1.deps import get_db
from app.ml.triage import evaluate_transaction
from app.services.mitigation import choose_action
from app.services.notifications import dispatch_notification
from app.services.session_revoke import revoke_session
from app.api.v1.routes_dashboard import manager

router = APIRouter(prefix="/api/v1", tags=["transactions"])

@router.post("/transactions", response_model=TransactionOut)
async def create_transaction(tx_in: TransactionIn, db: AsyncSession = Depends(get_db)):
    triage_result = evaluate_transaction(tx_in)
    
    mitigation = choose_action(triage_result["final_risk_score"], tx_in.description)
    action = mitigation["action"]
    
    db_tx = Transaction(
        user_id=tx_in.user_id,
        amount=tx_in.amount,
        currency=tx_in.currency,
        location_lat=tx_in.location_lat,
        location_lon=tx_in.location_lon,
        device_id=tx_in.device_id,
        network_fingerprint=tx_in.network_fingerprint,
        merchant_category=tx_in.merchant_category,
        description=tx_in.description,
    )
    db.add(db_tx)
    await db.flush() 
    
    db_verdict = Verdict(
        transaction_id=db_tx.id,
        tier1_score=triage_result["tier1_score"],
        tier2_score=triage_result["tier2_score"],
        zone=triage_result["zone"],
        final_risk_score=triage_result["final_risk_score"],
        action=action,
    )
    db.add(db_verdict)
    await db.commit()
    await db.refresh(db_tx)
    
    if action in {"NOTIFY", "FREEZE", "BLOCK"}:
        dispatch_notification(action, tx_in.user_id)
    if action == "BLOCK":
        revoke_session(tx_in.user_id)
        
    await manager.broadcast({
        "type": "new_transaction",
        "data": {
            "id": db_tx.id,
            "user_id": db_tx.user_id,
            "amount": db_tx.amount,
            "action": action,
            "risk_score": triage_result["final_risk_score"],
            "zone": triage_result["zone"]
        }
    })
    
    return db_tx


@router.get("/transactions")
async def list_transactions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transaction).options(joinedload(Transaction.verdict))
    )
    transactions = result.scalars().unique().all()

    def format_status(action: str | None) -> str:
        return {
            "APPROVE": "approved",
            "NOTIFY": "flagged",
            "FREEZE": "pending",
            "BLOCK": "blocked",
        }.get(action, "pending")

    def serialize(tx: Transaction) -> dict:
        verdict = tx.verdict
        action = verdict.action if verdict else None
        return {
            "id": tx.id,
            "user_id": tx.user_id,
            "accountId": tx.user_id,
            "customerName": tx.user_id,
            "amount": tx.amount,
            "currency": tx.currency,
            "description": tx.description,
            "created_at": tx.created_at,
            "status": format_status(action),
            "riskScore": verdict.final_risk_score if verdict else None,
            "zone": verdict.zone if verdict else None,
            "action": action,
            "verdict": {
                "tier1_score": verdict.tier1_score,
                "tier2_score": verdict.tier2_score,
                "zone": verdict.zone,
                "final_risk_score": verdict.final_risk_score,
                "action": action,
            } if verdict else None,
        }

    return [serialize(tx) for tx in transactions]
