"""
System health and log schemas.
"""

from pydantic import BaseModel


class SystemHealthOut(BaseModel):
    """Matches frontend SystemHealth interface."""

    apiStatus: str
    apiLatencyMs: float
    dbStatus: str
    wsStatus: str
    serverLoad: float
    uptimePercent: float

    model_config = {"populate_by_name": True}


class LogEntryOut(BaseModel):
    """Matches frontend LogEntry interface."""

    id: str
    timestamp: str
    level: str
    source: str
    message: str

    model_config = {"populate_by_name": True, "from_attributes": True}
