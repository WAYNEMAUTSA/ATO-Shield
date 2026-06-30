from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

try:
    import kagglehub
except ImportError:  # pragma: no cover
    kagglehub = None
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

MODEL_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "tier1_model.joblib"


CURRENCY_CONVERSION = {
    "USD": 1.0,
    "EUR": 1.1,
    "GBP": 1.27,
    "INR": 0.012,
    "JPY": 0.0065,
}


def normalize_amount(amount: float, currency: str) -> float:
    rate = CURRENCY_CONVERSION.get(currency, 1.0)
    return amount * rate


def resolve_dataset_path(explicit_path: str | Path | None = None) -> Path | None:
    candidates: list[Path] = []
    if explicit_path is not None:
        candidates.append(Path(explicit_path))
    env_path = os.getenv("IEEE_DATASET_PATH")
    if env_path:
        candidates.append(Path(env_path))
    candidates.extend(
        [
            Path(__file__).resolve().parents[1] / "data" / "train_transaction.csv",
            Path(__file__).resolve().parents[1] / "data" / "train.csv",
            Path(__file__).resolve().parents[2] / "data" / "train_transaction.csv",
        ]
    )
    for candidate in candidates:
        if candidate.exists():
            return candidate

    if kagglehub is not None:
        try:
            downloaded_path = kagglehub.competition_download("ieee-fraud-detection")
            competition_dir = Path(downloaded_path)
            for possible_file in [competition_dir / "train_transaction.csv", competition_dir / "train.csv"]:
                if possible_file.exists():
                    return possible_file
        except Exception:
            return None
    return None


def train_ieee_dataset_model(dataset_path: str | Path, output_path: Path | None = None) -> dict[str, Any]:
    output_path = output_path or MODEL_PATH
    output_path.parent.mkdir(parents=True, exist_ok=True)

    dataset_path = Path(dataset_path)
    if not dataset_path.exists():
        return train_synthetic_tier1_model(output_path=output_path)

    frame = pd.read_csv(dataset_path)
    label_column = "isFraud"
    if label_column not in frame.columns:
        label_column = "Class"
    if label_column not in frame.columns:
        raise ValueError("Dataset must contain an isFraud or Class label column")

    target = frame[label_column]
    features = [
        column
        for column in frame.columns
        if column not in {label_column, "TransactionID", "transaction_id", "id"}
    ]

    numeric_features = [
        column for column in features if pd.api.types.is_numeric_dtype(frame[column]) and column not in {"isFraud", "Class"}
    ]
    categorical_features = [column for column in features if column not in numeric_features]

    if not numeric_features:
        numeric_features = [features[0]]

    X = frame[features]
    y = target.astype(int)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )

    model = make_pipeline(
        preprocessor,
        XGBClassifier(
            n_estimators=80,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
        ),
    )
    model.fit(X, y)

    linear_model = LinearRegression()
    linear_model.fit(X[numeric_features[:1]].fillna(0), y)

    artifact = {
        "model": model,
        "linear_model": linear_model,
        "model_type": "xgboost",
        "risk_baseline": float(y.mean()),
        "feature_columns": features,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "dataset_source": str(dataset_path),
        "metadata": {"created_by": "ieee-dataset-training", "notes": "Trained on a Kaggle/IEEE-style CSV dataset"},
    }
    joblib.dump(artifact, output_path)

    return artifact["metadata"] | {"model_type": artifact["model_type"], "risk_baseline": artifact["risk_baseline"], "path": str(output_path), "dataset_source": artifact["dataset_source"]}


def train_synthetic_tier1_model(output_path: Path | None = None) -> dict[str, Any]:
    output_path = output_path or MODEL_PATH
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rng = np.random.default_rng(42)
    n_samples = 240
    data = pd.DataFrame(
        {
            "amount": rng.uniform(1, 800, size=n_samples),
            "merchant": rng.choice(["amazon", "paypal", "ebay", "steam", "unknown"], size=n_samples),
            "country": rng.choice(["US", "GB", "NG", "KE", "ZA"], size=n_samples),
            "device_id": rng.choice(["device-1", "device-2", "device-3", "device-4"], size=n_samples),
            "description": rng.choice(
                [
                    "normal purchase",
                    "subscription renewal",
                    "urgent account verification required immediately",
                    "password reset required",
                    "gift card purchase",
                ],
                size=n_samples,
            ),
        }
    )

    fraud_flags = []
    for _, row in data.iterrows():
        score = 0.0
        if row["amount"] > 500:
            score += 0.25
        if row["merchant"] in {"unknown", "steam"}:
            score += 0.2
        if row["country"] in {"NG", "KE", "ZA"}:
            score += 0.15
        if "urgent" in str(row["description"]).lower() or "password" in str(row["description"]).lower():
            score += 0.35
        fraud_flags.append(min(score, 1.0))

    data["is_fraud"] = (np.array(fraud_flags) > 0.45).astype(int)

    features = ["amount", "merchant", "country", "device_id", "description"]
    X = data[features]
    y = data["is_fraud"]

    categorical_features = ["merchant", "country", "device_id", "description"]
    numeric_features = ["amount"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )

    model = make_pipeline(preprocessor, RandomForestClassifier(n_estimators=80, random_state=42))
    model.fit(X, y)

    linear_model = LinearRegression()
    linear_model.fit(X[["amount"]], y)

    artifact = {
        "model": model,
        "linear_model": linear_model,
        "model_type": "xgboost",
        "risk_baseline": float(np.mean(y)),
        "feature_columns": features,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "metadata": {"created_by": "synthetic-training", "notes": "Fallback model for local development"},
    }
    joblib.dump(artifact, output_path)

    return artifact["metadata"] | {"model_type": artifact["model_type"], "risk_baseline": artifact["risk_baseline"], "path": str(output_path)}


def load_model(output_path: Path | None = None) -> dict[str, Any]:
    artifact_path = output_path or MODEL_PATH
    if not artifact_path.exists():
        dataset_path = resolve_dataset_path()
        if dataset_path is not None:
            train_ieee_dataset_model(dataset_path, output_path=artifact_path)
        else:
            train_synthetic_tier1_model(output_path=artifact_path)
    return joblib.load(artifact_path)


def score_transaction(payload: dict[str, Any], output_path: Path | None = None) -> dict[str, Any]:
    artifact = load_model(output_path=output_path)
    model = artifact["model"]
    linear_model = artifact["linear_model"]

    feature_columns = artifact.get("feature_columns", [])
    numeric_features = artifact.get("numeric_features") or []
    categorical_features = artifact.get("categorical_features") or []

    # Get currency and normalize amount to USD-equivalent
    currency = str(payload.get("currency", "USD")).upper()
    original_amount = float(payload.get("amount", 0.0))
    normalized_amount = normalize_amount(original_amount, currency)

    # India-specific risk adjustment
    is_india = str(payload.get("country", "")).upper() == "IN"
    india_risk_adjustment = 0.0
    if is_india and currency == "INR":
        # Larger amounts are normal in India (remittances, etc.)
        if original_amount > 500000:  # 500k+ INR is common
            india_risk_adjustment = -0.05
        # Smaller amounts might be high-risk (small frequent fraud attempts)
        if original_amount < 1000:  # Less than 1000 INR
            india_risk_adjustment = 0.03

    defaults: dict[str, Any] = {}
    for feature in feature_columns:
        normalized = str(feature).lower()
        if normalized in {"amount", "transactionamt", "amt", "amount_usd"}:
            defaults[feature] = normalized_amount
        elif normalized in {"merchant", "merchant_category", "merchantname", "merch"}:
            defaults[feature] = str(payload.get("merchant", "unknown")).lower()
        elif normalized in {"country", "countrycode", "country_code", "location"}:
            defaults[feature] = str(payload.get("country", "US")).upper()
        elif normalized in {"device_id", "deviceid", "device", "device"}:
            defaults[feature] = str(payload.get("device_id", "device-0")).lower()
        elif normalized in {"description", "description_text", "memo", "notes", "text"}:
            defaults[feature] = str(payload.get("description", ""))
        elif feature in numeric_features or normalized.startswith("v") or normalized.startswith("card") or normalized.endswith("dt"):
            defaults[feature] = 0.0
        else:
            defaults[feature] = "unknown"

    if not feature_columns:
        defaults = {
            "amount": normalized_amount,
            "merchant": str(payload.get("merchant", "unknown")).lower(),
            "country": str(payload.get("country", "US")).upper(),
            "device_id": str(payload.get("device_id", "device-0")).lower(),
            "description": str(payload.get("description", "")),
        }

    frame = pd.DataFrame([defaults])
    frame = frame.reindex(columns=feature_columns or defaults.keys(), fill_value=0 if feature_columns else None)

    base_probability = float(model.predict_proba(frame)[0][1])
    linear_feature = numeric_features[0] if numeric_features else ("amount" if "amount" in frame.columns else next(iter(frame.columns)))
    linear_signal = float(linear_model.predict(frame[[linear_feature]].fillna(0))[0])
    risk_score = min(max(float(0.6 * base_probability + 0.4 * linear_signal + india_risk_adjustment), 0.0), 1.0)

    if risk_score < 0.3:
        action = "APPROVE"
        category = "safe"
    elif risk_score > 0.7:
        action = "BLOCK"
        category = "fraud"
    else:
        action = "NOTIFY"
        category = "review"

    if "urgent" in str(payload.get("description", "")).lower() or "password" in str(payload.get("description", "")).lower():
        risk_score = min(1.0, risk_score + 0.1)
        if risk_score > 0.7:
            action = "BLOCK"
            category = "fraud"
        elif risk_score > 0.3:
            action = "NOTIFY"
            category = "review"

    return {
        "risk_score": round(float(risk_score), 4),
        "action": action,
        "category": category,
        "currency": currency,
        "model_type": artifact.get("model_type", "xgboost"),
        "explanation": f"Risk score calculated for {currency} transaction with India-aware thresholds." if is_india else "Risk score calculated using multi-currency normalization.",
    }
