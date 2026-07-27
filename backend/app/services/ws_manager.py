"""
WebSocket connection manager.

In single-worker dev mode this uses in-process sets.
For horizontal scaling, replace broadcast() with Redis Pub/Sub fan-out
(the interface stays the same).
"""

import asyncio
import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger("rescuehive.ws")


class ConnectionManager:
    """Manages active WebSocket connections and message fan-out."""

    def __init__(self):
        # All connected sockets keyed by user_id
        self._connections: dict[str, list[WebSocket]] = {}
        # All connected sockets (flat list for broadcast)
        self._all: list[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self._all.append(websocket)
        self._connections.setdefault(user_id, []).append(websocket)
        logger.info("WebSocket connected: user=%s total=%d", user_id, len(self._all))

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self._all:
            self._all.remove(websocket)
        user_sockets = self._connections.get(user_id, [])
        if websocket in user_sockets:
            user_sockets.remove(websocket)
        logger.info("WebSocket disconnected: user=%s total=%d", user_id, len(self._all))

    async def broadcast(self, message: dict[str, Any]):
        """Send a message to all connected clients."""
        data = json.dumps(message)
        stale: list[tuple[WebSocket, str]] = []
        for ws in self._all:
            try:
                await ws.send_text(data)
            except Exception:
                # Find user_id for cleanup
                uid = self._find_user(ws)
                stale.append((ws, uid))
        # Clean up dead connections
        for ws, uid in stale:
            self.disconnect(ws, uid)

    async def send_to_user(self, user_id: str, message: dict[str, Any]):
        """Send a message to a specific user's connections."""
        data = json.dumps(message)
        for ws in self._connections.get(user_id, []):
            try:
                await ws.send_text(data)
            except Exception:
                self.disconnect(ws, user_id)

    async def heartbeat(self):
        """Send a ping to all connections. Run this on a periodic task."""
        message = json.dumps({"type": "ping"})
        stale: list[tuple[WebSocket, str]] = []
        for ws in self._all:
            try:
                await ws.send_text(message)
            except Exception:
                uid = self._find_user(ws)
                stale.append((ws, uid))
        for ws, uid in stale:
            self.disconnect(ws, uid)

    def _find_user(self, ws: WebSocket) -> str:
        for uid, sockets in self._connections.items():
            if ws in sockets:
                return uid
        return "unknown"

    @property
    def connection_count(self) -> int:
        return len(self._all)


# Singleton instance
ws_manager = ConnectionManager()


async def heartbeat_loop():
    """Background task that pings all WS clients every 30 seconds."""
    while True:
        await asyncio.sleep(30)
        await ws_manager.heartbeat()
