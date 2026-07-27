"""
Application settings loaded from environment variables.
Uses pydantic-settings for validation and defaults suitable for local dev.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite+aiosqlite:///./rescuehive.db"

    # ── JWT ───────────────────────────────────────────────────────────────
    JWT_SECRET: str = "change-me-in-production-use-a-long-random-string"
    JWT_ACCESS_TTL: int = 900          # 15 minutes
    JWT_REFRESH_TTL: int = 604800      # 7 days
    JWT_ALGORITHM: str = "HS256"

    # ── Redis (optional — in-process fallback for single-worker dev) ─────
    REDIS_URL: str | None = None

    # ── CORS ──────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── Storage ───────────────────────────────────────────────────────────
    S3_BUCKET: str | None = None
    S3_REGION: str | None = None
    S3_ENDPOINT_URL: str | None = None
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    UPLOAD_DIR: str = "./uploads"

    # ── Seed ──────────────────────────────────────────────────────────────
    SEED_ON_STARTUP: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
