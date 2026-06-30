from app.models.schemas import TransactionIn

def analyze_context(tx: TransactionIn) -> float:
    if not tx.description:
        return 0.2
        
    text = tx.description.lower()
    coercive_keywords = [
        "urgent", "verify", "account locked", "password", 
        "security check", "immediately", "fraud alert"
    ]
    
    if any(kw in text for kw in coercive_keywords):
        return 0.85
        
    return 0.2
