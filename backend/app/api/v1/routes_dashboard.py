from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.dashboard_ws import DashboardConnectionManager

router = APIRouter(prefix="/api/v1", tags=["dashboard"])
manager = DashboardConnectionManager()


@router.websocket("/dashboard/ws")
async def dashboard_ws(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
