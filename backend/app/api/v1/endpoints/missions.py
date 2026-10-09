from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.mission import MissionCreate, MissionUpdate, MissionResponse, MissionListResponse
from app.services.mission_service import (
    get_missions, get_mission_by_id, create_mission, update_mission,
    delete_mission, start_mission, pause_mission, resume_mission, stop_mission,
)
from app.core.security import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/missions", tags=["Missions"])


@router.get("", response_model=MissionListResponse, summary="List all missions")
def api_list_missions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a paginated list of all missions."""
    missions, total = get_missions(db, skip=skip, limit=limit)
    return MissionListResponse(missions=missions, total=total)


@router.post("", response_model=MissionResponse, status_code=201, summary="Create a new mission")
def api_create_mission(
    data: MissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new mission in PLANNED status."""
    return create_mission(db, name=data.name, description=data.description, created_by=current_user.id)


@router.get("/{mission_id}", response_model=MissionResponse, summary="Get mission details")
def api_get_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a specific mission."""
    return get_mission_by_id(db, mission_id)


@router.put("/{mission_id}", response_model=MissionResponse, summary="Update a mission")
def api_update_mission(
    mission_id: UUID,
    data: MissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update mission fields (name, description, status, explored_area)."""
    return update_mission(
        db, mission_id,
        name=data.name,
        description=data.description,
        status=data.status,
        explored_area=data.explored_area,
    )


@router.delete("/{mission_id}", status_code=204, summary="Delete a mission")
def api_delete_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a mission and all associated data."""
    delete_mission(db, mission_id)


# ─── Mission Control Endpoints ────────────────────────────────────────
@router.post("/{mission_id}/start", response_model=MissionResponse, summary="Start a mission")
def api_start_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Transition mission from PLANNED/PAUSED to ACTIVE."""
    return start_mission(db, mission_id)


@router.post("/{mission_id}/pause", response_model=MissionResponse, summary="Pause a mission")
def api_pause_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pause an ACTIVE mission."""
    return pause_mission(db, mission_id)


@router.post("/{mission_id}/resume", response_model=MissionResponse, summary="Resume a paused mission")
def api_resume_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resume a PAUSED mission back to ACTIVE."""
    return resume_mission(db, mission_id)


@router.post("/{mission_id}/stop", response_model=MissionResponse, summary="Stop a mission")
def api_stop_mission(
    mission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stop and complete an ACTIVE/PAUSED mission."""
    return stop_mission(db, mission_id)
