import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AICTE FDR-Guard Portal"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/fdr_guard"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./fdr_guard.db"
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aicte_fdr_super_secret_jwt_key_sih_2026_x89a")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Uploads & Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    SAMPLE_DOCS_DIR: str = os.path.join(BASE_DIR, "sample_docs")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
