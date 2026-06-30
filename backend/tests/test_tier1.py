import pytest
from app.models.schemas import TransactionIn
from app.ml.tier1_xgboost import predict_risk

def test_tier1_predict_risk():
    tx = TransactionIn(user_id="u1", amount=100.0)
    score = predict_risk(tx)
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0
