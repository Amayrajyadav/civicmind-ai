from typing import Generator
from .config import settings, Settings
from .services.firebase_service import FirebaseService
from .services.gemini_service import GeminiService
from .services.processing_service import ProcessingService

def get_settings() -> Settings:
    """Dependency injection for settings."""
    return settings

def get_firebase_service() -> FirebaseService:
    """Dependency injection for Firebase actions."""
    return FirebaseService

def get_gemini_service() -> GeminiService:
    """Dependency injection for Gemini actions."""
    return GeminiService

def get_processing_service() -> ProcessingService:
    """Dependency injection for processing state."""
    return ProcessingService
