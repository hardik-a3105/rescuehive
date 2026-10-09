from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Mission Schemas ──────────────────────────────────────────────────
class MissionCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None


class MissionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    explored_area: Optional[float] = None


class MissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration: Optional[float] = None
    explored_area: Optional[float] = None
    created_by: Optional[UUID] = None
    created_at: datetime


class MissionListResponse(BaseModel):
    missions: List[MissionResponse]
    total: int
