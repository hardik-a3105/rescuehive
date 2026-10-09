from sqlalchemy.orm import Session

from app.models.domain import (
    Mission, MissionStatus,
    Robot, RobotStatus,
    Detection, DetectionType, DetectionStatus,
    Alert, AlertStatus,
)
from app.schemas.dashboard import DashboardSummary


def get_dashboard_summary(db: Session) -> DashboardSummary:
    """
    Aggregate mission intelligence data for the command center dashboard.
    """
    # Active mission
    active_mission = (
        db.query(Mission)
        .filter(Mission.status == MissionStatus.ACTIVE)
        .order_by(Mission.started_at.desc())
        .first()
    )

    # Robot counts
    total_robots = db.query(Robot).count()
    active_robots = db.query(Robot).filter(Robot.status == RobotStatus.ACTIVE).count()

    # Detection counts
    total_detections = db.query(Detection).count()
    pending_detections = db.query(Detection).filter(Detection.status == DetectionStatus.PENDING).count()

    # Victim count (PERSON type, CONFIRMED or PENDING)
    victim_count = (
        db.query(Detection)
        .filter(
            Detection.detection_type == DetectionType.PERSON,
            Detection.status.in_([DetectionStatus.CONFIRMED, DetectionStatus.PENDING]),
        )
        .count()
    )

    # Hazard count (FIRE, GAS_CYLINDER, DEBRIS — CONFIRMED or PENDING)
    hazard_types = [DetectionType.FIRE, DetectionType.GAS_CYLINDER, DetectionType.DEBRIS]
    hazard_count = (
        db.query(Detection)
        .filter(
            Detection.detection_type.in_(hazard_types),
            Detection.status.in_([DetectionStatus.CONFIRMED, DetectionStatus.PENDING]),
        )
        .count()
    )

    # Active alerts
    active_alerts = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE).count()

    # Total missions
    total_missions = db.query(Mission).count()

    # Explored area & duration from active mission
    explored_area = 0.0
    mission_duration = None
    active_mission_name = None
    active_mission_id = None

    if active_mission:
        active_mission_name = active_mission.name
        active_mission_id = str(active_mission.id)
        explored_area = active_mission.explored_area or 0.0
        if active_mission.started_at:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            mission_duration = (now - active_mission.started_at).total_seconds()

    return DashboardSummary(
        active_mission=active_mission_name,
        active_mission_id=active_mission_id,
        active_robots=active_robots,
        total_robots=total_robots,
        explored_area=explored_area,
        victim_count=victim_count,
        hazard_count=hazard_count,
        active_alerts=active_alerts,
        mission_duration=mission_duration,
        total_detections=total_detections,
        pending_detections=pending_detections,
        total_missions=total_missions,
    )
