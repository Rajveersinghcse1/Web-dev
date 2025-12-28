"""
Configuration settings for the AI Music Generator
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Model settings
    DEFAULT_MODEL_SIZE: str = "small"  # small, medium, large, melody
    ENABLE_GPU: bool = True
    MODEL_CACHE_SIZE: int = 3
    MAX_DURATION: float = 60.0  # Maximum generation duration in seconds
    
    # Audio settings
    SAMPLE_RATE: int = 44100
    DEFAULT_BPM: int = 120
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Directories
    OUTPUT_DIR: str = "output"
    PRESETS_DIR: str = "presets"
    TEMP_DIR: str = "temp"
    MODELS_DIR: str = "models"
    
    # Security
    SECRET_KEY: str = "ultra-secure-music-generator-key-2024"
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE: int = 30
    MAX_CONCURRENT_GENERATIONS: int = 5
    
    # WebSocket settings
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS: int = 100
    
    # AI Model configurations
    MUSICGEN_MODELS: dict = {
        "small": "facebook/musicgen-small",
        "medium": "facebook/musicgen-medium", 
        "large": "facebook/musicgen-large",
        "melody": "facebook/musicgen-melody"
    }
    
    AUDIOGEN_MODEL: str = "facebook/audiogen-medium"
    
    # Performance settings
    BATCH_SIZE: int = 1
    NUM_WORKERS: int = 4
    PREFETCH_FACTOR: int = 2
    
    # Caching
    ENABLE_CACHE: bool = True
    CACHE_TTL: int = 3600  # 1 hour
    MAX_CACHE_SIZE: int = 100
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Create directories
        for directory in [self.OUTPUT_DIR, self.PRESETS_DIR, self.TEMP_DIR, self.MODELS_DIR]:
            os.makedirs(directory, exist_ok=True)

# Create global settings instance
settings = Settings()