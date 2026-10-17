from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


# ─── Auth Schemas ─────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="FIELD_OPERATOR")


class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
