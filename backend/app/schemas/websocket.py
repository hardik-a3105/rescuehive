"""
WebSocket message schemas matching websocket.ts discriminated union.
"""

from pydantic import BaseModel

from app.schemas.robot import Coordinates


class TelemetryWsMessage(BaseModel):
    type: str = "telemetry"
    robotId: str
    timestamp: str
    battery: float
    speed: float
    temperature: float
    signal: float
    position: Coordinates


class RobotStatusWsMessage(BaseModel):
    type: str = "robot_status"
    robotId: str
    health: str
    task: str
    connection: str
    timestamp: str


class MapUpdateWsMessage(BaseModel):
    type: str = "map_update"
    robotId: str
    position: Coordinates
    trail: list[Coordinates]
    timestamp: str


class DetectionWsMessage(BaseModel):
    type: str = "detection"
    kind: str  # "victim" | "hazard"
    payload: dict


class MissionProgressWsMessage(BaseModel):
    type: str = "mission_progress"
    missionId: str
    areaCoverage: float
    robotsActive: int
    timestamp: str
