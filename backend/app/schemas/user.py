"""
User schemas — camelCase on the wire to match frontend domain.ts.
"""

from enum import Enum

from pydantic import BaseModel, EmailStr


class Role(str, Enum):
    support = "support"
    field_operator = "field_operator"
    incident_commander = "incident_commander"
    system_administrator = "system_administrator"
    developer = "developer"


class UserOut(BaseModel):
    """Matches the frontend's User interface in domain.ts."""

    id: str
    name: str
    email: str
    role: Role
    avatarUrl: str | None = None
    callsign: str | None = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = Role.support
    callsign: str | None = None


class UpdateUserRequest(BaseModel):
    name: str | None = None
    role: Role | None = None
    is_active: bool | None = None
    callsign: str | None = None
