from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Robot Schemas ────────────────────────────────────────────────────
class RobotCreate(BaseModel):
    robot_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    status: str = Field(default="IDLE")
    battery: Optional[float] = 100.0
    connection_status: str = Field(default="DISCONNECTED")
    x: Optional[float] = 0.0
    y: Optional[float] = 0.0
    z: Optional[float] = 0.0
    current_task: Optional[str] = None
    mission_id: Optional[UUID] = None


class RobotUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    status: Optional[str] = None
    battery: Optional[float] = None
    connection_status: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    current_task: Optional[str] = None
    mission_id: Optional[UUID] = None


class RobotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    robot_id: str
    name: str
    status: str
    battery: Optional[float] = None
    connection_status: str
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    current_task: Optional[str] = None
    last_seen: Optional[datetime] = None
    mission_id: Optional[UUID] = None


class RobotListResponse(BaseModel):
    robots: List[RobotResponse]
    total: int
