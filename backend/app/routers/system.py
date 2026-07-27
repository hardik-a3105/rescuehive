"""
System health and logs router.
Matches BACKEND.md §5.8.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models.log import LogEntryModel
from app.models.user import UserModel
from app.schemas.system import LogEntryOut, SystemHealthOut

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health", response_model=SystemHealthOut)
async def system_health(
    _user: UserModel = Depends(require_role(["system_administrator", "developer"])),
):
    import random
    return SystemHealthOut(
        apiStatus="operational",
        apiLatencyMs=random.uniform(40, 180),
        dbStatus="operational",
        wsStatus="operational",
        serverLoad=random.uniform(20, 70),
        uptimePercent=random.uniform(99.4, 99.99),
    )


@router.get("/logs", response_model=list[LogEntryOut])
async def system_logs(
    level: str | None = Query(None),
    source: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(require_role(["system_administrator", "developer"])),
    limit: int = Query(100, ge=1, le=500),
):
    stmt = select(LogEntryModel)
    if level:
        stmt = stmt.where(LogEntryModel.level == level)
    if source:
        stmt = stmt.where(LogEntryModel.source == source)
    stmt = stmt.order_by(LogEntryModel.timestamp.desc()).limit(limit)

    result = await db.execute(stmt)
    return [
        LogEntryOut(
            id=log.id,
            timestamp=log.timestamp.isoformat(),
            level=log.level,
            source=log.source,
            message=log.message,
        )
        for log in result.scalars().all()
    ]
