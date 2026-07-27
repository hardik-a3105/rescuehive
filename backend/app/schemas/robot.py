"""
Robot schemas — camelCase on the wire.
"""

from enum import Enum

from pydantic import BaseModel


class RobotHealth(str, Enum):
    nominal = "nominal"
    warning = "warning"
    critical = "critical"
    offline = "offline"


class RobotTask(str, Enum):
    exploring = "exploring"
    returning_home = "returning_home"
    idle = "idle"
    charging = "charging"
    manual_control = "manual_control"
    e_stopped = "e_stopped"


class Coordinates(BaseModel):
    lat: float
    lng: float


class SensorStatus(BaseModel):
    lidar: str  # "ok" | "degraded" | "fault"
    thermal: str
    camera: str
    gas: str


class RobotOut(BaseModel):
    """Matches frontend Robot interface in domain.ts."""

    id: str
    name: str
    callsign: str
    battery: float
    signal: float
    health: RobotHealth
    task: RobotTask
    temperature: float
    speed: float
    position: Coordinates
    distanceTravelled: float
    sensors: SensorStatus
    lastSeen: str
    connection: str
    trail: list[Coordinates]
    missionId: str

    model_config = {"populate_by_name": True, "from_attributes": True}


class RetaskRequest(BaseModel):
    task: RobotTask


class CameraFeedOut(BaseModel):
    """Matches frontend CameraFeed interface."""

    robotId: str
    robotName: str
    streamUrl: str
    fps: int
    latencyMs: float
    isLive: bool
    isRecording: bool
    hasThermal: bool
    hasDepth: bool
    lastFrameAt: str

    model_config = {"populate_by_name": True}
