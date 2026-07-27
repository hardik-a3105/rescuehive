"""
FastAPI dependencies for authentication and role-based access control.
"""

import logging
from typing import Callable

import jwt
from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import UserModel
from app.services.auth_service import decode_token
from app.utils import AppError

logger = logging.getLogger("rescuehive.auth")


async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db),
) -> UserModel:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the authenticated UserModel or raises 401.
    """
    if not authorization.startswith("Bearer "):
        raise AppError(401, "INVALID_TOKEN", "Missing or malformed Authorization header.")

    token = authorization[7:]  # strip "Bearer "

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise AppError(401, "TOKEN_EXPIRED", "Access token has expired.")
    except jwt.InvalidTokenError:
        raise AppError(401, "INVALID_TOKEN", "Invalid access token.")

    if payload.get("type") != "access":
        raise AppError(401, "INVALID_TOKEN", "Token is not an access token.")

    user_id = payload.get("sub")
    if not user_id:
        raise AppError(401, "INVALID_TOKEN", "Token missing subject claim.")

    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise AppError(401, "USER_NOT_FOUND", "User not found or deactivated.")

    return user


def require_role(allowed_roles: list[str]) -> Callable:
    """
    FastAPI dependency factory: enforces that the current user has one of
    the specified roles. Usage:
        @router.get("/admin/users", dependencies=[Depends(require_role(["system_administrator"]))])
    """

    async def _check_role(user: UserModel = Depends(get_current_user)) -> UserModel:
        if user.role not in allowed_roles:
            raise AppError(
                403,
                "INSUFFICIENT_ROLE",
                f"This action requires one of: {', '.join(allowed_roles)}",
            )
        return user

    return _check_role
