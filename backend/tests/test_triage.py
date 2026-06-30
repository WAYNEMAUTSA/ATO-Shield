import pytest
from app.models.schemas import TransactionIn
from app.ml.triage import evaluate_transaction

def test_evaluate_transaction():
    tx = TransactionIn(user_id="u1", amount=100.0, description="lunch")
    result = evaluate_transaction(tx)
    
    assert "tier1_score" in result
    assert "zone" in result
    assert "final_risk_score" in result
    
    if result["tier1_score"] == 0.5:
        assert result["zone"] == "Gray"
        assert result["tier2_score"] == 0.2
        assert result["final_risk_score"] == 0.35
