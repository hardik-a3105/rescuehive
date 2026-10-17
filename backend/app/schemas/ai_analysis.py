from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.detection import DetectionResponse


class VisionFinding(BaseModel):
    """Structured finding returned by the vision LLM."""
    type: str = Field(..., description="Target type: PERSON, FIRE, GAS_CYLINDER, DEBRIS, EMERGENCY_EXIT, HELMET, BACKPACK, etc.")
    description: str = Field(..., description="Short description of what is visible")
    evidence: str = Field(..., description="Visual evidence observed in the frame")
    location_description: Optional[str] = Field(None, description="Approximate region (e.g., lower-left, center)")
    estimated_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Uncalibrated model estimate if supplied")
    review_priority: Optional[str] = Field("MEDIUM", description="Suggested review priority: HIGH, MEDIUM, LOW")


class VisionModelResult(BaseModel):
    """Direct JSON structure requested from the vision model."""
    scene_summary: str = Field(..., description="Overall description of the disaster scene")
    findings: List[VisionFinding] = Field(default_factory=list, description="List of visible target objects or hazards")


class AIAnalysisResponse(BaseModel):
    """API response returned to the frontend after image analysis and persistence."""
    model_config = ConfigDict(from_attributes=True)

    scene_summary: str
    model_name: str
    analysis_source: str = "OLLAMA_VISION_LLM"
    image_path: str
    image_url: str
    detections: List[DetectionResponse]
    raw_findings_count: int
    uncalibrated_disclaimer: str = (
        "AI-generated vision interpretation with uncalibrated confidence estimates. "
        "Requires human-in-the-loop review before confirmation."
    )


class OllamaStatusResponse(BaseModel):
    """Health/readiness status of local Ollama vision runtime."""
    available: bool
    model: str
    model_ready: bool
    base_url: str
    message: str
