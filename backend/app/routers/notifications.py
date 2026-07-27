"""
Notifications router — list, mark-read-all, mark-one-read.
Matches BACKEND.md §5.5.
"""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.notification import NotificationModel
from app.models.user import UserModel
from app.schemas.notification import NotificationOut
from app.utils import AppError

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(NotificationModel)
        .where(NotificationModel.user_id == user.id)
        .order_by(NotificationModel.timestamp.desc())
        .offset(offset)
        .limit(limit)
    )
    return [
        NotificationOut(
            id=n.id,
            severity=n.severity,
            title=n.title,
            message=n.message,
            timestamp=n.timestamp.isoformat() if n.timestamp else "",
            read=n.read,
            category=n.category,
        )
        for n in result.scalars().all()
    ]


@router.post("/read-all", status_code=204)
async def read_all(
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
):
    await db.execute(
        update(NotificationModel)
        .where(NotificationModel.user_id == user.id)
        .values(read=True)
    )
    return Response(status_code=204)


@router.patch("/{notification_id}", response_model=NotificationOut)
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    user: UserModel = Depends(get_current_user),
):
    result = await db.execute(
        select(NotificationModel)
        .where(NotificationModel.id == notification_id)
        .where(NotificationModel.user_id == user.id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise AppError(404, "NOTIFICATION_NOT_FOUND", "Notification not found.")

    notif.read = True
    await db.flush()
    await db.refresh(notif)

    return NotificationOut(
        id=notif.id,
        severity=notif.severity,
        title=notif.title,
        message=notif.message,
        timestamp=notif.timestamp.isoformat() if notif.timestamp else "",
        read=notif.read,
        category=notif.category,
    )
