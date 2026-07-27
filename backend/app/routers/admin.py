"""
Admin router — user and fleet management.
Matches BACKEND.md §5.7. Restricted to system_administrator role.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models.robot import RobotModel
from app.models.user import UserModel
from app.schemas.user import CreateUserRequest, UpdateUserRequest, UserOut
from app.services.auth_service import hash_password
from app.utils import AppError

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_dep = require_role(["system_administrator"])


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    result = await db.execute(select(UserModel).order_by(UserModel.created_at.desc()))
    return [
        UserOut(
            id=u.id, name=u.name, email=u.email, role=u.role,
            avatarUrl=u.avatar_url, callsign=u.callsign,
        )
        for u in result.scalars().all()
    ]


@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(
    body: CreateUserRequest,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    # Check email uniqueness
    existing = await db.execute(
        select(UserModel).where(UserModel.email == body.email.lower())
    )
    if existing.scalar_one_or_none():
        raise AppError(409, "EMAIL_EXISTS", "A user with this email already exists.")

    user = UserModel(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=body.role.value,
        callsign=body.callsign,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return UserOut(
        id=user.id, name=user.name, email=user.email, role=user.role,
        avatarUrl=user.avatar_url, callsign=user.callsign,
    )


@router.patch("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise AppError(404, "USER_NOT_FOUND", "User not found.")

    if body.name is not None:
        target.name = body.name
    if body.role is not None:
        target.role = body.role.value
    if body.is_active is not None:
        target.is_active = body.is_active
    if body.callsign is not None:
        target.callsign = body.callsign

    await db.flush()
    await db.refresh(target)

    return UserOut(
        id=target.id, name=target.name, email=target.email, role=target.role,
        avatarUrl=target.avatar_url, callsign=target.callsign,
    )


@router.delete("/users/{user_id}", status_code=204)
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise AppError(404, "USER_NOT_FOUND", "User not found.")

    target.is_active = False
    await db.flush()
    return Response(status_code=204)


@router.get("/fleet")
async def fleet_inventory(
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    result = await db.execute(select(RobotModel))
    robots = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "callsign": r.callsign,
            "model": r.model,
            "missionId": r.mission_id,
            "health": r.health,
            "task": r.task,
            "battery": r.battery,
            "connection": r.connection,
        }
        for r in robots
    ]


@router.patch("/fleet/{robot_id}")
async def update_robot_config(
    robot_id: str,
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(_admin_dep),
):
    result = await db.execute(select(RobotModel).where(RobotModel.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise AppError(404, "ROBOT_NOT_FOUND", "Robot not found.")

    # For now, return the robot's config — extend with body parsing as needed.
    return {"id": robot.id, "name": robot.name, "callsign": robot.callsign, "model": robot.model}
