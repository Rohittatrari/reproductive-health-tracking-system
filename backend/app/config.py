import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reproductive Health Tracking System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "reproductive-health-super-secret-jwt-key-2026-secure-random")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Defaults to SQLite for immediate out-of-the-box local operation; can be overridden by PostgreSQL URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./reproductive_health.db")
    
    # AI Assistant configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Reports storage directory
    REPORTS_DIR: str = os.getenv("REPORTS_DIR", "./generated_reports")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
