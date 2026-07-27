"""
Auth router — login, refresh, logout, forgot/reset password, me.
Matches BACKEND.md §3.3.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import UserModel
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    ResetPasswordRequest,
)
from app.schemas.user import UserOut
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.utils import AppError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(UserModel).where(UserModel.email == body.email.lower())
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.password_hash):
        raise AppError(401, "INVALID_CREDENTIALS", "Invalid email or password.")

    if not user.is_active:
        raise AppError(403, "ACCOUNT_DISABLED", "This account has been deactivated.")

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    return LoginResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=UserOut(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatarUrl=user.avatar_url,
            callsign=user.callsign,
        ),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    import jwt as pyjwt

    try:
        payload = decode_token(body.refreshToken)
    except pyjwt.ExpiredSignatureError:
        raise AppError(401, "TOKEN_EXPIRED", "Refresh token has expired.")
    except pyjwt.InvalidTokenError:
        raise AppError(401, "INVALID_TOKEN", "Invalid refresh token.")

    if payload.get("type") != "refresh":
        raise AppError(401, "INVALID_TOKEN", "Token is not a refresh token.")

    user_id = payload.get("sub")
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise AppError(401, "USER_NOT_FOUND", "User not found or deactivated.")

    new_access = create_access_token(user.id, user.role)
    return RefreshResponse(accessToken=new_access)


@router.post("/logout", status_code=204)
async def logout(_user: UserModel = Depends(get_current_user)):
    # In a production system, blacklist the refresh token in Redis/DB.
    # For now, the frontend simply discards the token.
    return Response(status_code=204)


@router.post("/forgot-password", status_code=202)
async def forgot_password(body: ForgotPasswordRequest):
    # Always return 202 to avoid user enumeration (per spec).
    # In production, queue an email with a reset link.
    return Response(status_code=202)


@router.post("/reset-password", status_code=204)
async def reset_password(body: ResetPasswordRequest):
    # In production, validate the reset token and update the password.
    return Response(status_code=204)


@router.get("/me", response_model=UserOut)
async def me(user: UserModel = Depends(get_current_user)):
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        avatarUrl=user.avatar_url,
        callsign=user.callsign,
    )
