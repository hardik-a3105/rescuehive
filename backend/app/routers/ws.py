"""
WebSocket router.
Matches BACKEND.md §6.
"""

import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.services.auth_service import decode_token
from app.services.ws_manager import ws_manager

logger = logging.getLogger("rescuehive.ws")

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(None),
):
    """
    WebSocket endpoint. Expects JWT token as a query parameter.
    If the token is invalid or missing, closes the connection with code 4401.
    """
    if not token:
        await websocket.close(code=4401, reason="Missing token")
        return

    try:
        payload = decode_token(token)
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=4401, reason="Invalid token")
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4401, reason="Invalid token payload")
        return

    await ws_manager.connect(websocket, user_id)

    try:
        while True:
            # The client only receives data in this implementation,
            # but we need to receive to handle client disconnects.
            data = await websocket.receive_text()
            # If the client sends something like a manual ping, we could handle it here.
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
