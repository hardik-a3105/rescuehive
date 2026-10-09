"""
Import all models here so that Alembic and Base.metadata.create_all() can discover them.
"""
from app.db.base import Base  # noqa: F401

from app.models.domain import (  # noqa: F401
    User,
    Mission,
    Robot,
    Detection,
    Alert,
    MissionEvent,
)
