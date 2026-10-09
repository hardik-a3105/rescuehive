from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.domain import Mission, MissionStatus, MissionEvent


def get_missions(db: Session, skip: int = 0, limit: int = 100) -> tuple:
    """Return paginated list of missions."""
    total = db.query(Mission).count()
    missions = db.query(Mission).order_by(Mission.created_at.desc()).offset(skip).limit(limit).all()
    return missions, total


def get_mission_by_id(db: Session, mission_id: UUID) -> Mission:
    """Fetch a single mission by its ID."""
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission {mission_id} not found",
        )
    return mission


def create_mission(db: Session, name: str, description: Optional[str], created_by: Optional[UUID]) -> Mission:
    """Create a new mission in PLANNED status."""
    mission = Mission(
        name=name,
        description=description,
        status=MissionStatus.PLANNED,
        created_by=created_by,
    )
    db.add(mission)
    db.commit()
    db.refresh(mission)

    # Log creation event
    _log_event(db, mission.id, None, "MISSION_CREATED", f"Mission '{name}' created")
    return mission


def update_mission(db: Session, mission_id: UUID, **kwargs) -> Mission:
    """Update mission fields."""
    mission = get_mission_by_id(db, mission_id)
    for key, value in kwargs.items():
        if value is not None and hasattr(mission, key):
            if key == "status":
                try:
                    value = MissionStatus(value)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid status: {value}",
                    )
            setattr(mission, key, value)
    db.commit()
    db.refresh(mission)
    return mission


def delete_mission(db: Session, mission_id: UUID) -> None:
    """Delete a mission."""
    mission = get_mission_by_id(db, mission_id)
    db.delete(mission)
    db.commit()


def start_mission(db: Session, mission_id: UUID) -> Mission:
    """Transition mission to ACTIVE status."""
    mission = get_mission_by_id(db, mission_id)
    if mission.status not in (MissionStatus.PLANNED, MissionStatus.PAUSED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start mission in '{mission.status.value}' state",
        )
    mission.status = MissionStatus.ACTIVE
    mission.started_at = mission.started_at or datetime.now(timezone.utc)
    db.commit()
    db.refresh(mission)
    _log_event(db, mission.id, None, "MISSION_STARTED", f"Mission '{mission.name}' started")
    return mission


def pause_mission(db: Session, mission_id: UUID) -> Mission:
    """Pause an active mission."""
    mission = get_mission_by_id(db, mission_id)
    if mission.status != MissionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot pause mission in '{mission.status.value}' state",
        )
    mission.status = MissionStatus.PAUSED
    db.commit()
    db.refresh(mission)
    _log_event(db, mission.id, None, "MISSION_PAUSED", f"Mission '{mission.name}' paused")
    return mission


def resume_mission(db: Session, mission_id: UUID) -> Mission:
    """Resume a paused mission."""
    mission = get_mission_by_id(db, mission_id)
    if mission.status != MissionStatus.PAUSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resume mission in '{mission.status.value}' state",
        )
    mission.status = MissionStatus.ACTIVE
    db.commit()
    db.refresh(mission)
    _log_event(db, mission.id, None, "MISSION_RESUMED", f"Mission '{mission.name}' resumed")
    return mission


def stop_mission(db: Session, mission_id: UUID) -> Mission:
    """Stop / complete a mission."""
    mission = get_mission_by_id(db, mission_id)
    if mission.status not in (MissionStatus.ACTIVE, MissionStatus.PAUSED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot stop mission in '{mission.status.value}' state",
        )
    now = datetime.now(timezone.utc)
    mission.status = MissionStatus.COMPLETED
    mission.ended_at = now
    if mission.started_at:
        started_at = mission.started_at
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=timezone.utc)
        mission.duration = (now - started_at).total_seconds()
    db.commit()
    db.refresh(mission)
    _log_event(db, mission.id, None, "MISSION_STOPPED", f"Mission '{mission.name}' completed")
    return mission


def _log_event(db: Session, mission_id: UUID, robot_id: Optional[UUID], event_type: str, message: str):
    """Internal helper to log a mission event."""
    event = MissionEvent(
        mission_id=mission_id,
        robot_id=robot_id,
        event_type=event_type,
        message=message,
    )
    db.add(event)
    db.commit()
