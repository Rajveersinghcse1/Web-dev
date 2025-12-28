"""
Music generation API endpoints
"""

import os
import uuid
import asyncio
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import torch
import torchaudio
import numpy as np

from app.core.config import settings
from app.core.model_manager import ModelManager
from app.utils.audio_processor import AudioProcessor
from app.utils.logger import PerformanceLogger, setup_logger

router = APIRouter()
logger = setup_logger(__name__)
perf_logger = PerformanceLogger(logger)

# Request/Response models
class MusicGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt describing the music")
    duration: float = Field(10.0, ge=1.0, le=settings.MAX_DURATION, description="Duration in seconds")
    model_size: str = Field("small", description="Model size: small, medium, large, melody")
    temperature: float = Field(1.0, ge=0.1, le=2.0, description="Sampling temperature")
    top_k: int = Field(250, ge=1, le=500, description="Top-k sampling")
    top_p: float = Field(0.0, ge=0.0, le=1.0, description="Top-p sampling")
    cfg_coef: float = Field(3.0, ge=1.0, le=10.0, description="Classifier-free guidance coefficient")
    seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    output_format: str = Field("wav", description="Output format: wav, mp3, flac")

class AudioEffectRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt describing the audio effect")
    duration: float = Field(5.0, ge=1.0, le=30.0, description="Duration in seconds")
    temperature: float = Field(1.0, ge=0.1, le=2.0)
    output_format: str = Field("wav", description="Output format")

class GenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str
    file_path: Optional[str] = None
    duration: Optional[float] = None
    sample_rate: Optional[int] = None
    created_at: str

class BatchGenerationRequest(BaseModel):
    prompts: List[str] = Field(..., max_items=10, description="List of prompts")
    duration: float = Field(10.0, ge=1.0, le=settings.MAX_DURATION)
    model_size: str = Field("small")
    output_format: str = Field("wav")

# Dependency to get model manager
async def get_model_manager() -> ModelManager:
    from app.main import model_manager
    if not model_manager:
        raise HTTPException(status_code=503, detail="Model manager not available")
    
    # Initialize model manager if not already done
    if not model_manager.is_initialized:
        await model_manager.initialize(load_default_model=False)
    
    return model_manager

# Storage for generation tasks
generation_tasks = {}

@router.post("/generate", response_model=GenerationResponse)
async def generate_music(
    request: MusicGenerationRequest,
    background_tasks: BackgroundTasks,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """Generate music from text prompt"""
    
    # Validate model size
    if request.model_size not in settings.MUSICGEN_MODELS:
        raise HTTPException(status_code=400, detail=f"Invalid model size: {request.model_size}")
    
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Set seed for reproducibility
    if request.seed is not None:
        torch.manual_seed(request.seed)
        np.random.seed(request.seed)
    
    logger.info(f"🎵 Starting music generation task {task_id}: '{request.prompt}'")
    
    # Store task info
    generation_tasks[task_id] = {
        "status": "queued",
        "prompt": request.prompt,
        "created_at": datetime.now().isoformat(),
        "progress": 0
    }
    
    # Start background generation
    background_tasks.add_task(
        generate_music_background,
        task_id,
        request,
        model_manager
    )
    
    return GenerationResponse(
        task_id=task_id,
        status="queued",
        message="Music generation queued",
        created_at=datetime.now().isoformat()
    )

async def generate_music_background(
    task_id: str,
    request: MusicGenerationRequest,
    model_manager: ModelManager
):
    """Background task for music generation"""
    try:
        # Update task status
        generation_tasks[task_id]["status"] = "generating"
        generation_tasks[task_id]["progress"] = 10
        
        perf_logger.start_timer(f"music_generation_{task_id}")
        
        # Generate music
        wav, sample_rate = await model_manager.generate_music(
            prompt=request.prompt,
            duration=request.duration,
            model_size=request.model_size,
            temperature=request.temperature,
            top_k=request.top_k,
            top_p=request.top_p,
            cfg_coef=request.cfg_coef
        )
        
        generation_tasks[task_id]["progress"] = 70
        
        # Save audio file
        output_filename = f"music_{task_id}.{request.output_format}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        audio_processor = AudioProcessor()
        await audio_processor.save_audio(
            wav.cpu().numpy()[0],
            output_path,
            sample_rate,
            request.output_format
        )
        
        generation_tasks[task_id].update({
            "status": "completed",
            "file_path": output_path,
            "duration": request.duration,
            "sample_rate": sample_rate,
            "progress": 100
        })
        
        perf_logger.end_timer(f"music_generation_{task_id}")
        logger.info(f"✅ Music generation completed: {task_id}")
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"❌ Music generation failed for {task_id}: {e}")
        logger.error(f"Full traceback: {error_details}")
        generation_tasks[task_id].update({
            "status": "failed",
            "error": str(e),
            "progress": 0
        })

@router.post("/generate-audio-effect", response_model=GenerationResponse)
async def generate_audio_effect(
    request: AudioEffectRequest,
    background_tasks: BackgroundTasks,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """Generate audio effects using AudioGen"""
    
    task_id = str(uuid.uuid4())
    
    logger.info(f"🔊 Starting audio effect generation task {task_id}: '{request.prompt}'")
    
    generation_tasks[task_id] = {
        "status": "queued",
        "prompt": request.prompt,
        "created_at": datetime.now().isoformat(),
        "progress": 0
    }
    
    background_tasks.add_task(
        generate_audio_effect_background,
        task_id,
        request,
        model_manager
    )
    
    return GenerationResponse(
        task_id=task_id,
        status="queued",
        message="Audio effect generation queued",
        created_at=datetime.now().isoformat()
    )

async def generate_audio_effect_background(
    task_id: str,
    request: AudioEffectRequest,
    model_manager: ModelManager
):
    """Background task for audio effect generation"""
    try:
        generation_tasks[task_id]["status"] = "generating"
        generation_tasks[task_id]["progress"] = 10
        
        perf_logger.start_timer(f"audio_generation_{task_id}")
        
        # Generate audio effect
        wav, sample_rate = await model_manager.generate_audio_effect(
            prompt=request.prompt,
            duration=request.duration,
            temperature=request.temperature
        )
        
        generation_tasks[task_id]["progress"] = 70
        
        # Save audio file
        output_filename = f"audio_{task_id}.{request.output_format}"
        output_path = os.path.join(settings.OUTPUT_DIR, output_filename)
        
        audio_processor = AudioProcessor()
        await audio_processor.save_audio(
            wav.cpu().numpy()[0],
            output_path,
            sample_rate,
            request.output_format
        )
        
        generation_tasks[task_id].update({
            "status": "completed",
            "file_path": output_path,
            "duration": request.duration,
            "sample_rate": sample_rate,
            "progress": 100
        })
        
        perf_logger.end_timer(f"audio_generation_{task_id}")
        logger.info(f"✅ Audio effect generation completed: {task_id}")
        
    except Exception as e:
        logger.error(f"❌ Audio effect generation failed for {task_id}: {e}")
        generation_tasks[task_id].update({
            "status": "failed",
            "error": str(e),
            "progress": 0
        })

@router.get("/status/{task_id}")
async def get_generation_status(task_id: str):
    """Get status of a generation task"""
    
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = generation_tasks[task_id]
    
    return {
        "task_id": task_id,
        "status": task_info["status"],
        "progress": task_info.get("progress", 0),
        "created_at": task_info["created_at"],
        "file_path": task_info.get("file_path"),
        "error": task_info.get("error")
    }

@router.get("/download/{task_id}")
async def download_generated_file(task_id: str):
    """Download generated audio file"""
    
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = generation_tasks[task_id]
    
    if task_info["status"] != "completed":
        raise HTTPException(status_code=400, detail="Generation not completed")
    
    file_path = task_info.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=os.path.basename(file_path)
    )

@router.post("/batch-generate")
async def batch_generate_music(
    request: BatchGenerationRequest,
    background_tasks: BackgroundTasks,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """Generate multiple music tracks from a batch of prompts"""
    
    if len(request.prompts) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 prompts allowed")
    
    batch_id = str(uuid.uuid4())
    task_ids = []
    
    for i, prompt in enumerate(request.prompts):
        task_id = f"{batch_id}_{i}"
        task_ids.append(task_id)
        
        music_request = MusicGenerationRequest(
            prompt=prompt,
            duration=request.duration,
            model_size=request.model_size,
            output_format=request.output_format
        )
        
        generation_tasks[task_id] = {
            "status": "queued",
            "prompt": prompt,
            "created_at": datetime.now().isoformat(),
            "progress": 0,
            "batch_id": batch_id
        }
        
        background_tasks.add_task(
            generate_music_background,
            task_id,
            music_request,
            model_manager
        )
    
    return {
        "batch_id": batch_id,
        "task_ids": task_ids,
        "status": "queued",
        "total_tasks": len(task_ids)
    }

@router.get("/batch-status/{batch_id}")
async def get_batch_status(batch_id: str):
    """Get status of a batch generation"""
    
    batch_tasks = {
        task_id: task_info for task_id, task_info in generation_tasks.items()
        if task_info.get("batch_id") == batch_id
    }
    
    if not batch_tasks:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    completed = sum(1 for task in batch_tasks.values() if task["status"] == "completed")
    failed = sum(1 for task in batch_tasks.values() if task["status"] == "failed")
    total = len(batch_tasks)
    
    return {
        "batch_id": batch_id,
        "total_tasks": total,
        "completed": completed,
        "failed": failed,
        "in_progress": total - completed - failed,
        "tasks": batch_tasks
    }

@router.delete("/task/{task_id}")
async def cancel_generation(task_id: str):
    """Cancel a generation task"""
    
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = generation_tasks[task_id]
    
    if task_info["status"] in ["completed", "failed"]:
        raise HTTPException(status_code=400, detail="Task already finished")
    
    generation_tasks[task_id]["status"] = "cancelled"
    
    return {"message": f"Task {task_id} cancelled"}

@router.get("/models")
async def list_available_models():
    """List available AI models"""
    
    return {
        "musicgen_models": list(settings.MUSICGEN_MODELS.keys()),
        "audiogen_model": settings.AUDIOGEN_MODEL,
        "default_model": settings.DEFAULT_MODEL_SIZE
    }

@router.get("/stats")
async def get_generation_stats():
    """Get generation statistics"""
    
    total_tasks = len(generation_tasks)
    completed = sum(1 for task in generation_tasks.values() if task["status"] == "completed")
    failed = sum(1 for task in generation_tasks.values() if task["status"] == "failed")
    in_progress = sum(1 for task in generation_tasks.values() if task["status"] in ["queued", "generating"])
    
    return {
        "total_generations": total_tasks,
        "completed": completed,
        "failed": failed,
        "in_progress": in_progress,
        "success_rate": completed / total_tasks * 100 if total_tasks > 0 else 0
    }