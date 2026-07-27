"""
Detection schemas — camelCase on the wire.
"""

from enum import Enum

from pydantic import BaseModel

from app.schemas.robot import Coordinates


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class DetectionStatus(str, Enum):
    unconfirmed = "unconfirmed"
    confirmed = "confirmed"
    rejected = "rejected"


class HazardType(str, Enum):
    fire = "fire"
    gas_leak = "gas_leak"
    debris = "debris"
    collapsed_structure = "collapsed_structure"
    blocked_path = "blocked_path"


class HazardSeverity(str, Enum):
    low = "low"
    moderate = "moderate"
    severe = "severe"
    extreme = "extreme"


class VictimDetectionOut(BaseModel):
    """Matches frontend VictimDetection interface."""

    id: str
    missionId: str
    robotId: str
    robotName: str
    imageUrl: str
    confidence: float
    position: Coordinates
    distance: float
    priority: Priority
    detectedAt: str
    status: DetectionStatus
    notes: str | None = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class HazardDetectionOut(BaseModel):
    """Matches frontend HazardDetection interface."""

    id: str
    missionId: str
    type: HazardType
    severity: HazardSeverity
    position: Coordinates
    robotId: str
    robotName: str
    imageUrl: str
    detectedAt: str
    status: DetectionStatus

    model_config = {"populate_by_name": True, "from_attributes": True}


class UpdateDetectionRequest(BaseModel):
    status: DetectionStatus
    notes: str | None = None
