import os
import logging
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Setup basic logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("civicmind_config")

class Settings(BaseSettings):
    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Firebase Configuration
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None

    # Server Configuration
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"
    ALLOW_ORIGINS: str = "*"

    # Fallback options
    FORCE_MOCK: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_firebase_configured(self) -> bool:
        if self.FORCE_MOCK:
            return False
        if self.FIREBASE_SERVICE_ACCOUNT_PATH and os.path.exists(self.FIREBASE_SERVICE_ACCOUNT_PATH):
            return True
        if self.FIREBASE_PROJECT_ID and self.FIREBASE_CLIENT_EMAIL and self.FIREBASE_PRIVATE_KEY:
            return True
        return False

    @property
    def is_gemini_configured(self) -> bool:
        if self.FORCE_MOCK:
            return False
        return bool(self.GEMINI_API_KEY)

    @property
    def parsed_origins(self) -> List[str]:
        if not self.ALLOW_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOW_ORIGINS.split(",")]

settings = Settings()

# Adjust root logger level based on settings
logging.getLogger().setLevel(settings.LOG_LEVEL.upper())
logger.info("Configuration loaded.")
if not settings.is_firebase_configured:
    logger.warning("Firebase credentials not configured fully or FORCE_MOCK is True. Firestore & Storage will run in MOCK mode.")
if not settings.is_gemini_configured:
    logger.warning("GEMINI_API_KEY is not configured or FORCE_MOCK is True. Gemini analysis will run in MOCK mode.")
