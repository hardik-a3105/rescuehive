from typing import Optional
from pydantic import BaseModel


# ─── Dashboard Summary Schema ─────────────────────────────────────────
class DashboardSummary(BaseModel):
    active_mission: Optional[str] = None
    active_mission_id: Optional[str] = None
    active_robots: int = 0
    total_robots: int = 0
    explored_area: float = 0.0
    victim_count: int = 0
    hazard_count: int = 0
    active_alerts: int = 0
    mission_duration: Optional[float] = None
    total_detections: int = 0
    pending_detections: int = 0
    total_missions: int = 0
