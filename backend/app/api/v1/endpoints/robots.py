from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.robot import RobotCreate, RobotUpdate, RobotResponse, RobotListResponse
from app.services.robot_service import get_robots, get_robot_by_id, create_robot, update_robot, delete_robot
from app.core.security import get_current_user
from app.models.domain import User

router = APIRouter(prefix="/robots", tags=["Robots"])


@router.get("", response_model=RobotListResponse, summary="List all robots")
def api_list_robots(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a paginated list of all registered robots."""
    robots, total = get_robots(db, skip=skip, limit=limit)
    return RobotListResponse(robots=robots, total=total)


@router.get("/{robot_id}", response_model=RobotResponse, summary="Get robot details")
def api_get_robot(
    robot_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a specific robot."""
    return get_robot_by_id(db, robot_id)


@router.post("", response_model=RobotResponse, status_code=201, summary="Register a new robot")
def api_create_robot(
    data: RobotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new robot in the system."""
    return create_robot(db, **data.model_dump())


@router.put("/{robot_id}", response_model=RobotResponse, summary="Update a robot")
def api_update_robot(
    robot_id: UUID,
    data: RobotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update robot telemetry and status fields."""
    return update_robot(db, robot_id, **data.model_dump(exclude_unset=True))


@router.delete("/{robot_id}", status_code=204, summary="Remove a robot")
def api_delete_robot(
    robot_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a robot from the system."""
    delete_robot(db, robot_id)
