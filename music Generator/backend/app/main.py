"""
Ultra-Advanced AI Music Generator Backend
FastAPI application with real-time music generation capabilities
"""

import os
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings
from app.core.model_manager import ModelManager
from app.core.websocket_manager import WebSocketManager
from app.api import music_generation, audio_processing, presets
from app.utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

# Global instances
model_manager: Optional[ModelManager] = None
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global model_manager
    
    # Startup
    logger.info("🚀 Starting Ultra-Advanced AI Music Generator Backend")
    try:
        # Initialize model manager (without loading models immediately)
        model_manager = ModelManager()
        # Don't initialize models during startup - load them on-demand
        
        # Store in app state
        app.state.model_manager = model_manager
        app.state.websocket_manager = websocket_manager
        
        logger.info("✅ Backend initialized successfully")
        yield
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize backend: {e}")
        raise
    
    # Shutdown
    logger.info("🔄 Shutting down backend...")
    if model_manager:
        await model_manager.cleanup()
    logger.info("✅ Backend shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Ultra-Advanced AI Music Generator",
    description="Next-generation AI music generation with real-time capabilities",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(music_generation.router, prefix="/api/v1/music", tags=["Music Generation"])
app.include_router(audio_processing.router, prefix="/api/v1/audio", tags=["Audio Processing"])
app.include_router(presets.router, prefix="/api/v1/presets", tags=["Presets"])

# Static files
app.mount("/output", StaticFiles(directory="output"), name="output")
app.mount("/presets", StaticFiles(directory="presets"), name="presets")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Ultra-Advanced AI Music Generator Backend",
        "version": "2.0.0",
        "status": "running",
        "docs": "/api/docs"
    }

@app.get("/health")
async def simple_health():
    """Simple health check endpoint"""
    return {"status": "healthy", "message": "Backend is running successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        model_status = "ready" if model_manager and hasattr(model_manager, 'is_initialized') and model_manager.is_initialized else "loading"
        return {
            "status": "healthy",
            "models": model_status,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await websocket_manager.handle_message(websocket, data, model_manager)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket_manager.send_error(websocket, str(e))
        websocket_manager.disconnect(websocket)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info" if not settings.DEBUG else "debug"
    )