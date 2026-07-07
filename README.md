 # ATO Shield

**Account Takeover (ATO) Fraud Detection for UPI Mobile Payments**

An academic capstone project simulating a real-time fraud detection system for India's UPI ecosystem, combining a hybrid ML pipeline with a human-in-the-loop analyst workflow and drift-triggered self-retraining.

---

## Overview

ATO Shield is a full-stack simulation of a fraud detection system for UPI-based mobile payments. It consists of two user-facing surfaces and a Python-based ML backend:

- **Customer App** — a mobile-style UPI payment interface where users send/receive money
- **Analyst Dashboard** — a control-room style interface for fraud analysts to review flagged transactions, monitor live activity, and make decisions
- **ML Backend** — scores every transaction in real time, applies a three-tier decision system, and retrains itself on analyst-verified labels when data drift is detected

The project is designed to go beyond a standard fraud-classifier demo by addressing two things academic fraud-detection projects typically skip: **rigorous evaluation under class imbalance**, and **an auditable, safeguarded self-retraining loop** rather than naive self-labeling.

---

## Why This Project Is Different

Most academic ATO/fraud detection projects report accuracy on a static, imbalanced dataset and stop there. ATO Shield is built to withstand deeper scrutiny:

1. **Hybrid model architecture** — Isolation Forest (anomaly detection) feeds into XGBoost/LightGBM (classification), calibrated via logistic regression, rather than relying on a single model type.
2. **Three-tier decision system** — every transaction resolves to `auto-clear`, `step-up authentication`, or `hard block`, rather than a binary fraud/not-fraud output.
3. **Corrected self-retraining** — the model retrains on drift-triggered batches of **analyst-verified** labels, with a promotion gate: a retrained model only replaces the active one if it demonstrably outperforms it. This avoids the failure mode of a model self-labeling and drifting on its own mistakes.
4. **Six-layer evaluation framework** — cost-sensitive metrics, temporal drift evaluation, tier-specific precision/recall, latency, fairness, and explicit mapping to regulatory frameworks (see below), instead of a single accuracy number.
5. **Regulatory grounding** — the system architecture is explicitly mapped to RBI's *Authentication Mechanisms for Digital Payment Transactions Directions, 2025* and the RBI *FREE-AI* governance framework (August 2025).

---

## Architecture
Customer App (React, light theme)
│
▼
Supabase (Auth, Postgres, Realtime)
│
▼
FastAPI ML Service (Python)
├─ Feature pipeline
├─ Isolation Forest → XGBoost/LightGBM → Calibration
├─ Tiering logic (auto-clear / step-up / hard block)
└─ Drift monitor → Retraining job → Promotion gate
│
▼
Analyst Dashboard (React, dark "control room" theme)

- **Frontend**: React, Tailwind CSS, React Router, Lucide React
- **Database/Auth/Realtime**: Supabase (Postgres)
- **ML Backend**: Python, FastAPI, scikit-learn, XGBoost/LightGBM
- **Datasets**: PaySim (primary), IEEE-CIS Fraud Detection (secondary, generalization check)

---

## Project Structure
ATO-Shield/
├── frontend/       # Customer app + analyst dashboard (React)
├── backend/        # Python ML service (FastAPI, training, retraining)
├── README.md
└── .gitignore
See `frontend/README.md` for frontend-specific setup, and `backend/` for the ML pipeline structure.

---

## Datasets

| Dataset | Role | Notes |
|---|---|---|
| [PaySim](https://www.kaggle.com/datasets/ealaxi/paysim1) | Primary | Synthetic mobile money transactions. Balance-column features (`oldbalanceOrg`, `newbalanceOrig`, etc.) can leak the label — handled via ablation study, reported both with and without. |
| [IEEE-CIS Fraud Detection](https://www.kaggle.com/competitions/ieee-fraud-detection) | Secondary | Used to test generalization beyond the synthetic PaySim distribution. |

The commonly-used European Credit Card Fraud dataset was deliberately excluded as an already over-used benchmark in academic fraud detection literature.

---

## Status

Actively in development as a capstone project. Core architecture and academic framing are finalized; implementation of the ML backend and analyst-side interface is in progress.

---

## Author

Built as an academic capstone project focused on demonstrating rigorous, regulation-aware fraud detection system design for UPI payments.