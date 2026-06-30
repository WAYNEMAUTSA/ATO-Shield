from __future__ import annotations


def dispatch_notification(action: str, user_id: str) -> dict[str, str]:
    if action in {"FREEZE", "BLOCK"}:
        return {"channel": "email", "message": f"Security action {action} dispatched for {user_id}"}
    return {"channel": "sms", "message": f"Alert dispatched for {user_id}"}
