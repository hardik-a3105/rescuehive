from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Detection Schemas ────────────────────────────────────────────────
class DetectionCreate(BaseModel):
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    detection_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    image_path: Optional[str] = None


class DetectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    detection_type: str
    confidence: float
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    image_path: Optional[str] = None
    status: str
    timestamp: datetime


class DetectionListResponse(BaseModel):
    detections: List[DetectionResponse]
    total: int
