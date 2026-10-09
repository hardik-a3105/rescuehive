from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Alert Schemas ────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    severity: str = Field(default="LOW")
    title: str = Field(..., min_length=2, max_length=255)
    message: Optional[str] = None


class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mission_id: Optional[UUID] = None
    robot_id: Optional[UUID] = None
    severity: str
    title: str
    message: Optional[str] = None
    status: str
    created_at: datetime


class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
