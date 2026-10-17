"""
RescueHive — AI Vision Endpoints (Phase 4A)
===========================================
Versioned REST endpoints for local Ollama vision model analysis:
- POST /api/v1/ai/analyze-image: Upload disaster-scene photo for local Gemma 3 vision analysis
- GET /api/v1/ai/status: Verify Ollama runtime and vision model availability
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.domain import User
from app.schemas.ai_analysis import AIAnalysisResponse, OllamaStatusResponse
from app.services.vision_analysis_service import (
    analyze_and_persist_image,
    check_ollama_status,
)

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


@router.get(
    "/status",
    response_model=OllamaStatusResponse,
    summary="Check Ollama Vision Model Status",
    description="Reports connectivity to local Ollama server and availability of the configured vision model.",
)
async def api_get_ai_status(
    current_user: User = Depends(get_current_user),
) -> OllamaStatusResponse:
    """Verify local Ollama vision service health."""
    return await check_ollama_status()


@router.post(
    "/analyze-image",
    response_model=AIAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload & Analyze Disaster Scene Image",
    description=(
        "Upload a disaster-scene image (JPEG, PNG, WebP) for automated interpretation "
        "by the local vision LLM. Findings are structured and persisted as PENDING detections."
    ),
)
async def api_analyze_image(
    file: UploadFile = File(..., description="Disaster scene photographic payload (JPEG, PNG, WebP)"),
    mission_id: Optional[UUID] = Form(None, description="Optional active mission identifier"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIAnalysisResponse:
    """Analyze image with local vision LLM and persist detections into PostgreSQL."""
    return await analyze_and_persist_image(
        db=db,
        file=file,
        mission_id=mission_id,
        current_user=current_user,
    )
