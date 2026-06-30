from __future__ import annotations


def revoke_sessions(user_id: str) -> dict[str, str]:
    return {"user_id": user_id, "status": "revoked"}
