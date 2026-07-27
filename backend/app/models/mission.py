"""
Mission ORM model.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class MissionModel(Base):
    __tablename__ = "missions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="planning")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    area_coverage: Mapped[float] = mapped_column(Float, default=0.0)
    robots_active: Mapped[int] = mapped_column(Integer, default=0)
    victims_found: Mapped[int] = mapped_column(Integer, default=0)
    hazards_found: Mapped[int] = mapped_column(Integer, default=0)
    average_battery: Mapped[float] = mapped_column(Float, default=100.0)
    connection_health: Mapped[str] = mapped_column(String(50), default="live")
    location: Mapped[str] = mapped_column(String(500), nullable=False, default="Unknown")
    search_area_km2: Mapped[float] = mapped_column(Float, default=0.0)
    commander_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
