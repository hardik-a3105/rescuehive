from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.domain import Robot, RobotStatus, ConnectionStatus


def get_robots(db: Session, skip: int = 0, limit: int = 100) -> tuple:
    """Return paginated list of robots."""
    total = db.query(Robot).count()
    robots = db.query(Robot).order_by(Robot.robot_id).offset(skip).limit(limit).all()
    return robots, total


def get_robot_by_id(db: Session, robot_id: UUID) -> Robot:
    """Fetch a single robot by its UUID primary key."""
    robot = db.query(Robot).filter(Robot.id == robot_id).first()
    if not robot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Robot {robot_id} not found",
        )
    return robot


def create_robot(db: Session, **kwargs) -> Robot:
    """Register a new robot in the system."""
    # Check for duplicate robot_id
    existing = db.query(Robot).filter(Robot.robot_id == kwargs.get("robot_id")).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Robot with ID '{kwargs.get('robot_id')}' already exists",
        )

    # Validate enums
    robot_status = kwargs.get("status", "IDLE")
    try:
        robot_status = RobotStatus(robot_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid robot status: {robot_status}",
        )

    conn_status = kwargs.get("connection_status", "DISCONNECTED")
    try:
        conn_status = ConnectionStatus(conn_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid connection status: {conn_status}",
        )

    robot = Robot(
        robot_id=kwargs["robot_id"],
        name=kwargs["name"],
        status=robot_status,
        battery=kwargs.get("battery", 100.0),
        connection_status=conn_status,
        x=kwargs.get("x", 0.0),
        y=kwargs.get("y", 0.0),
        z=kwargs.get("z", 0.0),
        current_task=kwargs.get("current_task"),
        mission_id=kwargs.get("mission_id"),
        last_seen=datetime.now(timezone.utc),
    )
    db.add(robot)
    db.commit()
    db.refresh(robot)
    return robot


def update_robot(db: Session, robot_id: UUID, **kwargs) -> Robot:
    """Update robot fields."""
    robot = get_robot_by_id(db, robot_id)
    for key, value in kwargs.items():
        if value is not None and hasattr(robot, key):
            if key == "status":
                try:
                    value = RobotStatus(value)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid robot status: {value}",
                    )
            elif key == "connection_status":
                try:
                    value = ConnectionStatus(value)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid connection status: {value}",
                    )
            setattr(robot, key, value)
    robot.last_seen = datetime.now(timezone.utc)
    db.commit()
    db.refresh(robot)
    return robot


def delete_robot(db: Session, robot_id: UUID) -> None:
    """Remove a robot from the system."""
    robot = get_robot_by_id(db, robot_id)
    db.delete(robot)
    db.commit()
