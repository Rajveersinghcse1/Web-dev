"""
Audio processing API endpoints
"""

import os
import uuid
from typing import Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import numpy as np
import librosa
import soundfile as sf

from app.core.config import settings
from app.utils.audio_processor import AudioProcessor
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

# Request/Response models
class AudioEffectRequest(BaseModel):
    effect_type: str = Field(..., description="Type of effect: reverb, eq, normalize, fade, tempo, pitch")
    parameters: dict = Field({}, description="Effect parameters")

class AudioAnalysisResponse(BaseModel):
    duration: float
    sample_rate: int
    channels: int
    rms: float
    peak: float
    dynamic_range: float
    dominant_frequency: float
    spectral_centroid: float
    zero_crossing_rate: float

class AudioMixRequest(BaseModel):
    track_ids: List[str] = Field(..., description="List of audio track IDs to mix")
    gains: Optional[List[float]] = Field(None, description="Gain levels for each track")
    output_format: str = Field("wav", description="Output format")

# Storage for uploaded audio files
uploaded_files = {}

@router.post("/upload")
async def upload_audio_file(file: UploadFile = File(...)):
    """Upload an audio file for processing"""
    
    # Validate file type
    allowed_extensions = ['.wav', '.mp3', '.flac', '.aiff', '.ogg']
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    
    # Save uploaded file
    upload_path = os.path.join(settings.TEMP_DIR, f"{file_id}{file_extension}")
    
    try:
        content = await file.read()
        with open(upload_path, "wb") as f:
            f.write(content)
        
        # Store file info
        uploaded_files[file_id] = {
            "original_filename": file.filename,
            "file_path": upload_path,
            "uploaded_at": datetime.now().isoformat(),
            "file_size": len(content)
        }
        
        logger.info(f"📁 File uploaded: {file.filename} -> {file_id}")
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "size": len(content),
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/analyze/{file_id}", response_model=AudioAnalysisResponse)
async def analyze_audio(file_id: str):
    """Analyze uploaded audio file"""
    
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = uploaded_files[file_id]
    file_path = file_info["file_path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    try:
        # Load audio
        audio_data, sample_rate = librosa.load(file_path, sr=None)
        
        # Analyze audio
        audio_processor = AudioProcessor(sample_rate)
        analysis = audio_processor.analyze_audio(audio_data, sample_rate)
        
        logger.info(f"🔍 Audio analyzed: {file_id}")
        
        return AudioAnalysisResponse(**analysis)
        
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/effect/{file_id}")
async def apply_audio_effect(
    file_id: str,
    effect_request: AudioEffectRequest,
    background_tasks: BackgroundTasks
):
    """Apply audio effect to uploaded file"""
    
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = uploaded_files[file_id]
    file_path = file_info["file_path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    # Generate output file ID
    output_id = str(uuid.uuid4())
    
    # Start background processing
    background_tasks.add_task(
        process_audio_effect_background,
        file_id,
        output_id,
        effect_request
    )
    
    return {
        "task_id": output_id,
        "status": "processing",
        "message": f"Applying {effect_request.effect_type} effect"
    }

async def process_audio_effect_background(
    file_id: str,
    output_id: str,
    effect_request: AudioEffectRequest
):
    """Background task for audio effect processing"""
    
    try:
        file_info = uploaded_files[file_id]
        file_path = file_info["file_path"]
        
        # Load audio
        audio_data, sample_rate = librosa.load(file_path, sr=None)
        
        # Apply effect
        audio_processor = AudioProcessor(sample_rate)
        processed_audio = await apply_effect(audio_data, effect_request, audio_processor, sample_rate)
        
        # Save processed audio
        output_path = os.path.join(settings.OUTPUT_DIR, f"processed_{output_id}.wav")
        await audio_processor.save_audio(processed_audio, output_path, sample_rate, "wav")
        
        # Store result
        uploaded_files[output_id] = {
            "original_filename": f"processed_{file_info['original_filename']}",
            "file_path": output_path,
            "processed_at": datetime.now().isoformat(),
            "effect_applied": effect_request.effect_type,
            "source_file": file_id
        }
        
        logger.info(f"✅ Effect applied: {effect_request.effect_type} -> {output_id}")
        
    except Exception as e:
        logger.error(f"❌ Effect processing failed: {e}")
        # Store error info
        uploaded_files[output_id] = {
            "error": str(e),
            "status": "failed"
        }

async def apply_effect(audio_data: np.ndarray, effect_request: AudioEffectRequest, 
                      audio_processor: AudioProcessor, sample_rate: int) -> np.ndarray:
    """Apply specific audio effect"""
    
    effect_type = effect_request.effect_type
    params = effect_request.parameters
    
    if effect_type == "normalize":
        target_db = params.get("target_db", -20.0)
        return audio_processor.normalize_audio(audio_data, target_db)
    
    elif effect_type == "fade":
        fade_in = params.get("fade_in", 0.1)
        fade_out = params.get("fade_out", 0.1)
        return audio_processor.apply_fade(audio_data, fade_in, fade_out, sample_rate)
    
    elif effect_type == "eq":
        low_gain = params.get("low_gain", 0.0)
        mid_gain = params.get("mid_gain", 0.0)
        high_gain = params.get("high_gain", 0.0)
        return audio_processor.apply_eq(audio_data, low_gain, mid_gain, high_gain, sample_rate)
    
    elif effect_type == "reverb":
        room_size = params.get("room_size", 0.5)
        damping = params.get("damping", 0.5)
        return audio_processor.add_reverb(audio_data, room_size, damping, sample_rate)
    
    elif effect_type == "tempo":
        tempo_factor = params.get("tempo_factor", 1.0)
        return audio_processor.change_tempo(audio_data, tempo_factor, sample_rate)
    
    elif effect_type == "pitch":
        semitones = params.get("semitones", 0.0)
        return audio_processor.change_pitch(audio_data, semitones, sample_rate)
    
    else:
        raise ValueError(f"Unknown effect type: {effect_type}")

@router.post("/mix")
async def mix_audio_tracks(
    mix_request: AudioMixRequest,
    background_tasks: BackgroundTasks
):
    """Mix multiple audio tracks"""
    
    # Validate all track IDs exist
    for track_id in mix_request.track_ids:
        if track_id not in uploaded_files:
            raise HTTPException(status_code=404, detail=f"Track {track_id} not found")
    
    if len(mix_request.track_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 tracks required for mixing")
    
    # Generate output ID
    output_id = str(uuid.uuid4())
    
    # Start background mixing
    background_tasks.add_task(
        mix_audio_background,
        mix_request,
        output_id
    )
    
    return {
        "task_id": output_id,
        "status": "mixing",
        "message": f"Mixing {len(mix_request.track_ids)} tracks"
    }

async def mix_audio_background(mix_request: AudioMixRequest, output_id: str):
    """Background task for audio mixing"""
    
    try:
        audio_tracks = []
        sample_rates = []
        
        # Load all tracks
        for track_id in mix_request.track_ids:
            file_info = uploaded_files[track_id]
            file_path = file_info["file_path"]
            
            audio_data, sample_rate = librosa.load(file_path, sr=None)
            audio_tracks.append(audio_data)
            sample_rates.append(sample_rate)
        
        # Ensure all tracks have same sample rate
        target_sample_rate = max(sample_rates)
        normalized_tracks = []
        
        for i, (track, sr) in enumerate(zip(audio_tracks, sample_rates)):
            if sr != target_sample_rate:
                track = librosa.resample(track, orig_sr=sr, target_sr=target_sample_rate)
            normalized_tracks.append(track)
        
        # Mix tracks
        audio_processor = AudioProcessor(target_sample_rate)
        mixed_audio = audio_processor.mix_audio(normalized_tracks, mix_request.gains)
        
        # Save mixed audio
        output_path = os.path.join(settings.OUTPUT_DIR, f"mixed_{output_id}.{mix_request.output_format}")
        await audio_processor.save_audio(mixed_audio, output_path, target_sample_rate, mix_request.output_format)
        
        # Store result
        uploaded_files[output_id] = {
            "original_filename": f"mixed_audio_{output_id}.{mix_request.output_format}",
            "file_path": output_path,
            "mixed_at": datetime.now().isoformat(),
            "source_tracks": mix_request.track_ids,
            "track_count": len(mix_request.track_ids)
        }
        
        logger.info(f"✅ Audio mixed: {len(mix_request.track_ids)} tracks -> {output_id}")
        
    except Exception as e:
        logger.error(f"❌ Audio mixing failed: {e}")
        uploaded_files[output_id] = {
            "error": str(e),
            "status": "failed"
        }

@router.get("/download/{file_id}")
async def download_processed_audio(file_id: str):
    """Download processed audio file"""
    
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = uploaded_files[file_id]
    
    if "error" in file_info:
        raise HTTPException(status_code=400, detail=f"Processing failed: {file_info['error']}")
    
    file_path = file_info["file_path"]
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=file_info["original_filename"]
    )

@router.get("/files")
async def list_audio_files():
    """List all uploaded and processed audio files"""
    
    return {
        "files": {
            file_id: {
                "filename": info.get("original_filename", "unknown"),
                "uploaded_at": info.get("uploaded_at"),
                "processed_at": info.get("processed_at"),
                "mixed_at": info.get("mixed_at"),
                "effect_applied": info.get("effect_applied"),
                "track_count": info.get("track_count"),
                "status": "failed" if "error" in info else "ready"
            }
            for file_id, info in uploaded_files.items()
        }
    }

@router.delete("/file/{file_id}")
async def delete_audio_file(file_id: str):
    """Delete an audio file"""
    
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_info = uploaded_files[file_id]
    file_path = file_info.get("file_path")
    
    # Delete file from disk
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    
    # Remove from storage
    del uploaded_files[file_id]
    
    logger.info(f"🗑️ File deleted: {file_id}")
    
    return {"message": f"File {file_id} deleted successfully"}

@router.get("/status/{task_id}")
async def get_processing_status(task_id: str):
    """Get status of audio processing task"""
    
    if task_id not in uploaded_files:
        return {"status": "not_found"}
    
    file_info = uploaded_files[task_id]
    
    if "error" in file_info:
        return {
            "status": "failed",
            "error": file_info["error"]
        }
    
    if "processed_at" in file_info or "mixed_at" in file_info:
        return {
            "status": "completed",
            "file_path": file_info.get("file_path"),
            "filename": file_info.get("original_filename")
        }
    
    return {"status": "processing"}