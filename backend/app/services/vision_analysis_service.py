"""
RescueHive — Vision Analysis Service (Phase 4A)
================================================
Handles local Ollama Vision LLM integration for disaster-scene image analysis:
- Hardware/Ollama connectivity verification
- Image format, MIME, size, and integrity validation
- Safe local filesystem storage
- Vision LLM prompt orchestration and structured JSON extraction
- Mapping and persisting detection records in PostgreSQL
"""

import os
import io
import json
import uuid
import base64
import logging
from typing import Optional, List, Tuple
from uuid import UUID
from datetime import datetime

import httpx
from PIL import Image
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.domain import (
    Detection, DetectionType, DetectionStatus, User, Mission
)
from app.schemas.ai_analysis import (
    VisionFinding, VisionModelResult, AIAnalysisResponse, OllamaStatusResponse
)

logger = logging.getLogger("rescuehive.vision")

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SUPPORTED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Standard mapping from model-extracted labels to database DetectionType enum
TYPE_NORMALIZATION_MAP = {
    "PERSON": DetectionType.PERSON,
    "VICTIM": DetectionType.PERSON,
    "HUMAN": DetectionType.PERSON,
    "SURVIVOR": DetectionType.PERSON,
    "FIRE": DetectionType.FIRE,
    "FLAME": DetectionType.FIRE,
    "SMOKE": DetectionType.FIRE,
    "GAS_CYLINDER": DetectionType.GAS_CYLINDER,
    "GAS_TANK": DetectionType.GAS_CYLINDER,
    "CYLINDER": DetectionType.GAS_CYLINDER,
    "PROPANE_TANK": DetectionType.GAS_CYLINDER,
    "DEBRIS": DetectionType.DEBRIS,
    "RUBBLE": DetectionType.DEBRIS,
    "COLLAPSE": DetectionType.DEBRIS,
    "EMERGENCY_EXIT": DetectionType.EMERGENCY_EXIT,
    "EXIT": DetectionType.EMERGENCY_EXIT,
    "EXIT_DOOR": DetectionType.EMERGENCY_EXIT,
    "HELMET": DetectionType.HELMET,
    "HARD_HAT": DetectionType.HELMET,
    "BACKPACK": DetectionType.BACKPACK,
    "BAG": DetectionType.BACKPACK,
}


def _get_candidate_ollama_urls() -> List[str]:
    """
    Return candidate URLs to reach Ollama runtime.
    Accommodates native host execution and Docker containers (host.docker.internal).
    """
    configured = settings.OLLAMA_BASE_URL.rstrip("/")
    candidates = [configured]
    if "localhost" in configured or "127.0.0.1" in configured:
        candidates.append("http://host.docker.internal:11434")
    elif "host.docker.internal" in configured:
        candidates.append("http://localhost:11434")
    return list(dict.fromkeys(candidates))


async def check_ollama_status() -> OllamaStatusResponse:
    """
    Verify whether the local Ollama server is reachable and whether
    the required vision model is installed.
    """
    candidate_urls = _get_candidate_ollama_urls()
    last_error = ""

    for base_url in candidate_urls:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    target_model = settings.OLLAMA_VISION_MODEL
                    
                    # Model tag matching (e.g., 'gemma3:4b' or 'gemma3:4b-latest')
                    is_ready = any(
                        target_model in m or m.startswith(target_model.split(":")[0])
                        for m in models
                    )

                    if is_ready:
                        return OllamaStatusResponse(
                            available=True,
                            model=target_model,
                            model_ready=True,
                            base_url=base_url,
                            message=f"Local Ollama online and '{target_model}' is ready for vision analysis.",
                        )
                    else:
                        return OllamaStatusResponse(
                            available=True,
                            model=target_model,
                            model_ready=False,
                            base_url=base_url,
                            message=(
                                f"Ollama is running at {base_url}, but model '{target_model}' "
                                f"is not pulled. Run: ollama pull {target_model}"
                            ),
                        )
        except Exception as exc:
            last_error = str(exc)
            logger.debug("Failed checking Ollama at %s: %s", base_url, exc)

    return OllamaStatusResponse(
        available=False,
        model=settings.OLLAMA_VISION_MODEL,
        model_ready=False,
        base_url=settings.OLLAMA_BASE_URL,
        message=(
            f"Ollama server is unreachable at {settings.OLLAMA_BASE_URL}. "
            f"Ensure Ollama is started locally (`ollama serve`). Error: {last_error}"
        ),
    )


def validate_image_file(file: UploadFile, content: bytes) -> str:
    """
    Validate uploaded image extension, MIME type, size, and file integrity.
    Returns the validated file extension (e.g. '.jpg').
    """
    # 1. Size check
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        http_413 = getattr(status, "HTTP_413_CONTENT_TOO_LARGE", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        raise HTTPException(
            status_code=http_413,
            detail=f"Image file exceeds maximum allowable size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 2. Extension check
    filename = file.filename or "upload.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Supported formats: JPEG, PNG, WebP.",
        )

    # 3. MIME type check
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{content_type}'. Must be image/jpeg, image/png, or image/webp.",
        )

    # 4. Image integrity check via PIL
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image payload: {exc}",
        )

    return ext


def save_image_to_disk(content: bytes, ext: str) -> Tuple[str, str]:
    """
    Safely write the image to the uploads directory using a UUID filename.
    Returns (filesystem_path, web_url_path).
    """
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(upload_dir, safe_filename)

    with open(dest_path, "wb") as f:
        f.write(content)

    web_path = f"/uploads/{safe_filename}"
    return dest_path, web_path


def _build_analysis_prompt() -> str:
    """Construct deterministic structured vision prompt for Gemma 3."""
    return (
        "You are an expert search-and-rescue disaster intelligence AI assistant analyzing an image from an emergency scene.\n"
        "Examine the image carefully for visible emergency targets and hazards:\n"
        "- Person or possible trapped victim (PERSON)\n"
        "- Fire or visible smoke (FIRE)\n"
        "- Gas cylinder or hazardous pressurized containers (GAS_CYLINDER)\n"
        "- Structural debris or heavy rubble collapse (DEBRIS)\n"
        "- Emergency exit or safe egress passage (EMERGENCY_EXIT)\n"
        "- Safety helmet / hard hat (HELMET)\n"
        "- Backpack or personal gear (BACKPACK)\n\n"
        "Guidelines:\n"
        "1. Distinguish between visible evidence and speculation. Do not invent detections if not clearly visible.\n"
        "2. If no target objects or hazards are visible, return an empty 'findings' list with an accurate 'scene_summary'.\n"
        "3. Provide approximate location (e.g., 'upper-right', 'center foreground', 'lower-left').\n"
        "4. Estimate confidence between 0.0 and 1.0 (as an uncalibrated qualitative assessment).\n"
        "5. Output valid JSON ONLY matching this exact structure without markdown backticks:\n"
        "{\n"
        '  "scene_summary": "Short description of the disaster scene visible in the image",\n'
        '  "findings": [\n'
        "    {\n"
        '      "type": "PERSON",\n'
        '      "description": "Brief description of the finding",\n'
        '      "evidence": "Specific visible visual indicators observed",\n'
        '      "location_description": "Approximate location within the image frame",\n'
        '      "estimated_confidence": 0.85,\n'
        '      "review_priority": "HIGH"\n'
        "    }\n"
        "  ]\n"
        "}\n"
    )


async def call_ollama_vision(image_bytes: bytes) -> VisionModelResult:
    """
    Send the base64-encoded image to local Ollama vision endpoint and parse
    the structured JSON response into a VisionModelResult.
    """
    status_info = await check_ollama_status()
    if not status_info.available:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=status_info.message,
        )
    if not status_info.model_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=status_info.message,
        )

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "model": settings.OLLAMA_VISION_MODEL,
        "prompt": _build_analysis_prompt(),
        "images": [b64_image],
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.1,  # Low temperature for deterministic analysis
        },
    }

    raw_response_text = ""
    try:
        timeout = float(settings.AI_ANALYSIS_TIMEOUT_SECONDS)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{status_info.base_url}/api/generate",
                json=payload,
            )
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Ollama generation failed with status {resp.status_code}: {resp.text}",
                )
            res_json = resp.json()
            raw_response_text = res_json.get("response", "").strip()
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Ollama vision analysis timed out after {settings.AI_ANALYSIS_TIMEOUT_SECONDS}s.",
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Network communication with Ollama failed: {exc}",
        )

    # Clean markdown fences if model included ```json ... ```
    cleaned = raw_response_text
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    try:
        parsed_data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("Ollama returned malformed JSON: %s\nRaw output: %s", exc, raw_response_text)
        # Graceful fallback: construct empty findings with scene summary
        return VisionModelResult(
            scene_summary=raw_response_text[:300] if raw_response_text else "Scene analyzed by Vision LLM (unstructured response).",
            findings=[],
        )

    try:
        return VisionModelResult(**parsed_data)
    except Exception as exc:
        logger.warning("Pydantic validation of Ollama output failed: %s", exc)
        summary = str(parsed_data.get("scene_summary", "Disaster scene analyzed."))
        return VisionModelResult(scene_summary=summary, findings=[])


async def analyze_and_persist_image(
    db: Session,
    file: UploadFile,
    mission_id: Optional[UUID] = None,
    current_user: Optional[User] = None,
) -> AIAnalysisResponse:
    """
    Complete pipeline:
    1. Read and validate uploaded file
    2. Save image locally
    3. Run local Ollama vision inference
    4. Normalize findings and persist PENDING Detections into PostgreSQL
    5. Return formatted AIAnalysisResponse
    """
    content = await file.read()
    ext = validate_image_file(file, content)

    # Validate mission_id if passed
    if mission_id:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mission {mission_id} does not exist.",
            )

    # Save to disk
    fs_path, web_url = save_image_to_disk(content, ext)

    # Inference via Ollama
    result = await call_ollama_vision(content)

    # Persist findings into PostgreSQL
    created_detections: List[Detection] = []
    for finding in result.findings:
        raw_type = finding.type.strip().upper().replace(" ", "_")
        mapped_type = TYPE_NORMALIZATION_MAP.get(raw_type)

        if not mapped_type:
            # Check if raw_type matches any DetectionType value directly
            try:
                mapped_type = DetectionType(raw_type)
            except ValueError:
                # Default to DEBRIS or skip unsupported
                logger.info("Unrecognized finding type '%s', categorized as DEBRIS", raw_type)
                mapped_type = DetectionType.DEBRIS

        det = Detection(
            mission_id=mission_id,
            robot_id=None,  # No synthetic robot telemetry for uploaded images
            detection_type=mapped_type,
            confidence=finding.estimated_confidence if finding.estimated_confidence is not None else 0.85,
            x=None,
            y=None,
            z=None,
            image_path=web_url,
            status=DetectionStatus.PENDING,
            description=finding.description,
            evidence=finding.evidence,
            location_description=finding.location_description,
            analysis_source="OLLAMA_VISION_LLM",
            model_name=settings.OLLAMA_VISION_MODEL,
            review_priority=finding.review_priority or "MEDIUM",
            user_id=current_user.id if current_user else None,
        )
        db.add(det)
        created_detections.append(det)

    if created_detections:
        db.commit()
        for det in created_detections:
            db.refresh(det)

    return AIAnalysisResponse(
        scene_summary=result.scene_summary,
        model_name=settings.OLLAMA_VISION_MODEL,
        analysis_source="OLLAMA_VISION_LLM",
        image_path=fs_path,
        image_url=web_url,
        detections=created_detections,
        raw_findings_count=len(result.findings),
    )
