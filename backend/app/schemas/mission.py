"""
Mission schemas — camelCase on the wire.
"""

from enum import Enum

from pydantic import BaseModel


class MissionStatus(str, Enum):
    planning = "planning"
    active = "active"
    paused = "paused"
    completed = "completed"
    aborted = "aborted"


class MissionOut(BaseModel):
    """Matches frontend Mission interface in domain.ts."""

    id: str
    name: str
    status: MissionStatus
    startedAt: str
    endedAt: str | None = None
    areaCoverage: float
    robotsActive: int
    victimsFound: int
    hazardsFound: int
    averageBattery: float
    connectionHealth: str
    location: str
    searchAreaKm2: float

    model_config = {"populate_by_name": True, "from_attributes": True}


class CreateMissionRequest(BaseModel):
    name: str
    location: str
    searchAreaKm2: float = 0.0


class UpdateMissionRequest(BaseModel):
    name: str | None = None
    location: str | None = None
    searchAreaKm2: float | None = None


class MissionReportOut(BaseModel):
    """Full AI-generated report payload per BACKEND.md §5.6."""

    missionId: str
    missionName: str
    summary: str
    coverageTimeline: list[dict]
    victimPriorityBreakdown: dict
    robotStats: list[dict]
    aiRecommendations: list[str]
    aiDisclaimer: str = "AI Generated Recommendation — For Human Review Only"

    model_config = {"populate_by_name": True}
