import tempfile
from pathlib import Path

import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.ml.tier2_bert import analyze_context_text
from backend.src.core.detector import train_ieee_dataset_model, train_synthetic_tier1_model


def test_training_pipeline_writes_model_artifact():
    with tempfile.TemporaryDirectory() as tmpdir:
        model_path = Path(tmpdir) / "tier1_model.joblib"
        metadata = train_synthetic_tier1_model(output_path=model_path)

        assert model_path.exists()
        assert metadata["model_type"] in {"xgboost", "linear_regression"}
        assert 0.0 <= metadata["risk_baseline"] <= 1.0


def test_transaction_ingestion_returns_verdict():
    client = TestClient(app)
    response = client.post(
        "/api/v1/transactions/score",
        json={
            "user_id": "user-1",
            "merchant": "amazon",
            "amount": 175.0,
            "device_id": "device-9",
            "country": "US",
            "description": "Urgent account verification required immediately",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert 0.0 <= body["risk_score"] <= 1.0
    assert body["action"] in {"APPROVE", "NOTIFY", "FREEZE", "BLOCK"}
    assert body["category"] in {"safe", "review", "fraud"}


def test_ieee_dataset_training_uses_csv_input(tmp_path):
    dataset_path = tmp_path / "train_transaction.csv"
    pd.DataFrame(
        [
            {"TransactionID": 1, "isFraud": 0, "TransactionDT": 100, "TransactionAmt": 20.5, "card1": 1001, "card2": 10, "V1": -1.0, "V2": 0.2},
            {"TransactionID": 2, "isFraud": 1, "TransactionDT": 200, "TransactionAmt": 500.0, "card1": 1002, "card2": 11, "V1": 2.3, "V2": -1.0},
            {"TransactionID": 3, "isFraud": 0, "TransactionDT": 300, "TransactionAmt": 45.0, "card1": 1003, "card2": 12, "V1": -0.4, "V2": 0.1},
            {"TransactionID": 4, "isFraud": 1, "TransactionDT": 400, "TransactionAmt": 650.0, "card1": 1004, "card2": 13, "V1": 1.2, "V2": -0.7},
        ]
    ).to_csv(dataset_path, index=False)

    model_path = tmp_path / "tier1_model.joblib"
    metadata = train_ieee_dataset_model(dataset_path, output_path=model_path)

    assert model_path.exists()
    assert metadata["model_type"] == "xgboost"
    assert metadata["dataset_source"].endswith("train_transaction.csv")


def test_context_analysis_detects_pressure_language():
    result = analyze_context_text("Urgent verification required immediately. Reset your password now.")

    assert result["risk_boost"] > 0.0
    assert result["action"] in {"NOTIFY", "FREEZE", "BLOCK"}
