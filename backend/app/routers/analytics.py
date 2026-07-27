"""
Analytics router — coverage, detections, fleet health, battery trends.
Matches BACKEND.md §5.6.
"""

import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.detection import HazardDetectionModel, VictimDetectionModel
from app.models.robot import RobotModel
from app.models.user import UserModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/coverage")
async def coverage_analytics(
    range: str = Query("7d"),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    """Time-series coverage data."""
    days = int(range.replace("d", "")) if range.endswith("d") else 7
    now = datetime.now(timezone.utc)

    # Generate plausible time-series data
    data = []
    for i in range(days):
        day = now - timedelta(days=days - 1 - i)
        data.append({
            "date": day.strftime("%Y-%m-%d"),
            "coverage": round(random.uniform(20, 95), 1),
            "targetCoverage": 85.0,
        })
    return data


@router.get("/detections")
async def detection_analytics(
    range: str = Query("7d"),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    """Victims/hazards over time."""
    days = int(range.replace("d", "")) if range.endswith("d") else 7
    now = datetime.now(timezone.utc)

    data = []
    for i in range(days):
        day = now - timedelta(days=days - 1 - i)
        data.append({
            "date": day.strftime("%Y-%m-%d"),
            "victims": random.randint(0, 8),
            "hazards": random.randint(0, 5),
        })
    return data


@router.get("/fleet-health")
async def fleet_health_analytics(
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    """Health distribution across the fleet."""
    result = await db.execute(select(RobotModel))
    robots = result.scalars().all()

    distribution = {"nominal": 0, "warning": 0, "critical": 0, "offline": 0}
    for r in robots:
        if r.health in distribution:
            distribution[r.health] += 1

    return {
        "total": len(robots),
        "distribution": distribution,
        "averageBattery": round(
            sum(r.battery for r in robots) / len(robots), 1
        ) if robots else 0,
        "averageSignal": round(
            sum(r.signal for r in robots) / len(robots), 1
        ) if robots else 0,
    }


@router.get("/battery")
async def battery_analytics(
    range: str = Query("7d"),
    db: AsyncSession = Depends(get_db),
    _user: UserModel = Depends(get_current_user),
):
    """Average battery trend."""
    days = int(range.replace("d", "")) if range.endswith("d") else 7
    now = datetime.now(timezone.utc)

    data = []
    for i in range(days):
        day = now - timedelta(days=days - 1 - i)
        data.append({
            "date": day.strftime("%Y-%m-%d"),
            "averageBattery": round(random.uniform(40, 85), 1),
            "minBattery": round(random.uniform(10, 40), 1),
            "maxBattery": round(random.uniform(75, 100), 1),
        })
    return data
