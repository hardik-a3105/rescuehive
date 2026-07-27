"""
Auth request/response schemas.
"""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

    model_config = {"populate_by_name": True, "alias_generator": None}


class LoginResponse(BaseModel):
    accessToken: str
    refreshToken: str
    user: "UserOut"

    model_config = {"populate_by_name": True}


class RefreshRequest(BaseModel):
    refreshToken: str

    model_config = {"populate_by_name": True}


class RefreshResponse(BaseModel):
    accessToken: str

    model_config = {"populate_by_name": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str

    model_config = {"populate_by_name": True}


# Avoid circular import
from app.schemas.user import UserOut  # noqa: E402

LoginResponse.model_rebuild()
