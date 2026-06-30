from app.core.config import settings
from app.models.schemas import TransactionIn
from app.ml.tier1_xgboost import predict_risk
from app.ml.tier2_bert import analyze_context

def evaluate_transaction(tx: TransactionIn) -> dict:
    tier1_score = predict_risk(tx)
    
    if tier1_score < settings.tier1_green_threshold:
        zone = "Green"
        final_score = tier1_score
        tier2_score = None
    elif tier1_score > settings.tier1_red_threshold:
        zone = "Red"
        final_score = tier1_score
        tier2_score = None
    else:
        zone = "Gray"
        tier2_score = analyze_context(tx)
        final_score = (tier1_score + tier2_score) / 2.0
        
    return {
        "tier1_score": tier1_score,
        "tier2_score": tier2_score,
        "zone": zone,
        "final_risk_score": final_score
    }
