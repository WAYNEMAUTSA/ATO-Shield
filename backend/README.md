# ATO-Shield Backend

## Current status
- Added a lightweight FastAPI transaction scoring endpoint at `/api/v1/transactions/score`.
- Implemented a synthetic training pipeline that writes a local tier-1 model artifact for fallback scoring.
- Added basic SQLAlchemy models and Pydantic schemas for transactions, verdicts, and devices.
- Added regression tests that verify artifact generation and live request handling.

## Run locally
```bash
cd backend
pip install -r requirements.txt
PYTHONPATH=/workspaces/ATO-Shield uvicorn backend.src.main:app --host 127.0.0.1 --port 8000
```

## Notes
- The current tier-1 model is a synthetic development model rather than a production-trained classifier.
- The next milestones are to swap in a real IEEE-style dataset, bring in a stronger XGBoost pipeline, and add the deeper BERT-based review layer.
