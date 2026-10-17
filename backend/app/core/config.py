from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings for RescueHive Backend.
    Loaded from environment variables and .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "RescueHive — AI-Powered Multi-Robot Disaster Intelligence System"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database Configuration (PostgreSQL via SQLAlchemy)
    DATABASE_URL: str = "postgresql+psycopg2://rescuehive:rescuehive_secure_pass@localhost:5432/rescuehive_db"

    # Authentication Configuration (Phase 2 foundation)
    JWT_SECRET: str = "supersecret-insecure-key-for-development-only-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Frontend Integration
    FRONTEND_URL: str = "http://localhost:5173"

    # Local Ollama Vision LLM Configuration (Phase 4A)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_VISION_MODEL: str = "gemma3:4b"
    AI_ANALYSIS_TIMEOUT_SECONDS: int = 120
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    @property
    def cors_origins(self) -> List[str]:
        origins = [
            self.FRONTEND_URL,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        # Remove duplicates while preserving order
        return list(dict.fromkeys(origins))


settings = Settings()
