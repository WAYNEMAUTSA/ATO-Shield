import os
import pickle
import numpy as np
from app.models.schemas import TransactionIn

model = None

def load_model():
    global model
    if model is None:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "tier1_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                model = pickle.load(f)

def predict_risk(tx: TransactionIn) -> float:
    load_model()
    if model is None:
        return 0.5 
    
    amt = tx.amount
    dist1 = 50.0  # Placeholder for MVP
    c1 = 1.0      # Placeholder for MVP
    hour = 12     # Placeholder for MVP
    
    X = np.array([[amt, dist1, c1, hour]])
    proba = model.predict_proba(X)[0, 1]
    return float(proba)
