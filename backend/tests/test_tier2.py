import pytest
from app.models.schemas import TransactionIn
from app.ml.tier2_bert import analyze_context

def test_analyze_context_safe():
    tx = TransactionIn(user_id="u1", amount=100.0, description="lunch")
    score = analyze_context(tx)
    assert score == 0.2

def test_analyze_context_coercive():
    tx = TransactionIn(user_id="u1", amount=100.0, description="urgent verify your password")
    score = analyze_context(tx)
    assert score == 0.85
