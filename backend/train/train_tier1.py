import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, brier_score_loss
from sklearn.calibration import CalibratedClassifierCV
import xgboost as xgb

def train():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "ieee_features.csv")
    model_output_path = os.path.join(base_dir, "..", "app", "ml", "tier1_model.pkl")
    
    print("Loading data...")
    df = pd.read_csv(data_path)
    
    X = df[['TransactionAmt', 'dist1', 'C1', 'hour_of_day']]
    y = df['isFraud']
    
    print("Splitting data (train/calib/test)...")
    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    X_train, X_calib, y_train, y_calib = train_test_split(X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp)
    
    print("Training base XGBoost model...")
    base_clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    base_clf.fit(X_train, y_train)
    
    print("Calibrating probabilities...")
    calibrated_clf = CalibratedClassifierCV(base_clf, method='isotonic', cv='prefit')
    calibrated_clf.fit(X_calib, y_calib)
    
    print("Evaluating...")
    y_pred_proba = calibrated_clf.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba > 0.5).astype(int)
    
    auc = roc_auc_score(y_test, y_pred_proba)
    brier = brier_score_loss(y_test, y_pred_proba)
    print(f"ROC-AUC: {auc:.4f}")
    print(f"Brier Score: {brier:.4f}")
    print(classification_report(y_test, y_pred))
    
    print("Saving model...")
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    with open(model_output_path, 'wb') as f:
        pickle.dump(calibrated_clf, f)
    print(f"Model saved to {model_output_path}")

if __name__ == "__main__":
    train()
