from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Detection Schemas ────────────────────────────────────────────────
class DetectionCreate(BaseModel):
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    detection_type: str
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    image_path: Optional[str] = None
    description: Optional[str] = None
    evidence: Optional[str] = None
    location_description: Optional[str] = None
    analysis_source: Optional[str] = "ROBOT_TELEMETRY"
    model_name: Optional[str] = None
    review_priority: Optional[str] = None
    user_id: Optional[UUID] = None


class DetectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    detection_type: str
    confidence: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    image_path: Optional[str] = None
    status: str
    timestamp: datetime
    description: Optional[str] = None
    evidence: Optional[str] = None
    location_description: Optional[str] = None
    analysis_source: Optional[str] = "ROBOT_TELEMETRY"
    model_name: Optional[str] = None
    review_priority: Optional[str] = None
    user_id: Optional[UUID] = None


class DetectionListResponse(BaseModel):
    detections: List[DetectionResponse]
    total: int
