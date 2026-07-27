"""
Notification schemas.
"""

from pydantic import BaseModel


class NotificationOut(BaseModel):
    """Matches frontend AppNotification interface."""

    id: str
    severity: str
    title: str
    message: str
    timestamp: str
    read: bool
    category: str

    model_config = {"populate_by_name": True, "from_attributes": True}
