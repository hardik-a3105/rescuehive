"""
LogEntry ORM model for system logs.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LogEntryModel(Base):
    __tablename__ = "log_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    level: Mapped[str] = mapped_column(String(20), nullable=False, default="info")
    source: Mapped[str] = mapped_column(String(255), nullable=False, default="system")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    mission_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
