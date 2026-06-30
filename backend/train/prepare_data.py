import pandas as pd
import os

def prepare_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    transaction_path = os.path.join(base_dir, "train_transaction.csv")
    identity_path = os.path.join(base_dir, "train_identity.csv")
    output_path = os.path.join(base_dir, "ieee_features.csv")
    
    print("Loading datasets...")
    df_tx = pd.read_csv(transaction_path)
    df_id = pd.read_csv(identity_path)
    
    print("Merging datasets...")
    df = df_tx.merge(df_id, on='TransactionID', how='left')
    
    print("Extracting target and features...")
    target = 'isFraud'
    
    df_features = df[[target, 'TransactionAmt', 'dist1', 'C1', 'TransactionDT']].copy()
    df_features['hour_of_day'] = (df_features['TransactionDT'] // 3600) % 24
    df_features.drop(columns=['TransactionDT'], inplace=True)
    
    print(f"Total rows: {len(df_features)}")
    print(f"Fraud rate: {df_features[target].mean() * 100:.2f}%")
    
    print("Saving to ieee_features.csv...")
    df_features.to_csv(output_path, index=False)
    print("Done!")

if __name__ == "__main__":
    prepare_data()
