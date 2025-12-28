"""
Presets management API endpoints
"""

import os
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)

# Models
class Preset(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str = Field(..., description="Category: music, audio_effect, mix")
    parameters: Dict[str, Any]
    created_at: str
    updated_at: str
    created_by: Optional[str] = None
    tags: List[str] = []
    is_public: bool = True

class CreatePresetRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: str = Field(..., pattern="^(music|audio_effect|mix)$")
    parameters: Dict[str, Any]
    tags: List[str] = []
    is_public: bool = True

class UpdatePresetRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    parameters: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None

# Preset storage
def get_presets_file():
    """Get path to presets file"""
    return os.path.join(settings.PRESETS_DIR, "presets.json")

def load_presets() -> Dict[str, Preset]:
    """Load presets from file"""
    presets_file = get_presets_file()
    
    if not os.path.exists(presets_file):
        return {}
    
    try:
        with open(presets_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return {
                preset_id: Preset(**preset_data) 
                for preset_id, preset_data in data.items()
            }
    except Exception as e:
        logger.error(f"❌ Failed to load presets: {e}")
        return {}

def save_presets(presets: Dict[str, Preset]):
    """Save presets to file"""
    presets_file = get_presets_file()
    
    try:
        # Convert to serializable dict
        data = {
            preset_id: preset.dict() 
            for preset_id, preset in presets.items()
        }
        
        with open(presets_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        logger.info(f"💾 Presets saved: {len(presets)} presets")
        
    except Exception as e:
        logger.error(f"❌ Failed to save presets: {e}")
        raise

# Initialize with default presets
def initialize_default_presets():
    """Initialize system with default presets"""
    presets = load_presets()
    
    if not presets:  # Only add defaults if no presets exist
        default_presets = {
            "upbeat_electronic": {
                "id": "upbeat_electronic",
                "name": "Upbeat Electronic",
                "description": "Energetic electronic music with strong beats",
                "category": "music",
                "parameters": {
                    "duration": 30.0,
                    "model_size": "medium",
                    "temperature": 0.9,
                    "top_k": 200,
                    "cfg_coef": 4.0,
                    "prompt_template": "upbeat electronic dance music with {genre} influences, {tempo} bpm, {mood}"
                },
                "tags": ["electronic", "dance", "upbeat", "energetic"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_public": True
            },
            "ambient_chill": {
                "id": "ambient_chill",
                "name": "Ambient Chill",
                "description": "Relaxing ambient soundscapes",
                "category": "music",
                "parameters": {
                    "duration": 60.0,
                    "model_size": "small",
                    "temperature": 1.2,
                    "top_k": 300,
                    "cfg_coef": 2.5,
                    "prompt_template": "ambient chill music, {atmosphere}, peaceful and relaxing, {instruments}"
                },
                "tags": ["ambient", "chill", "relaxing", "peaceful"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_public": True
            },
            "cinematic_orchestral": {
                "id": "cinematic_orchestral",
                "name": "Cinematic Orchestral",
                "description": "Epic orchestral music for films and games",
                "category": "music",
                "parameters": {
                    "duration": 45.0,
                    "model_size": "large",
                    "temperature": 0.8,
                    "top_k": 250,
                    "cfg_coef": 5.0,
                    "prompt_template": "cinematic orchestral music, {mood}, epic and dramatic, full orchestra with {emphasis}"
                },
                "tags": ["orchestral", "cinematic", "epic", "dramatic"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_public": True
            },
            "nature_sounds": {
                "id": "nature_sounds",
                "name": "Nature Sounds",
                "description": "Natural environmental sounds and effects",
                "category": "audio_effect",
                "parameters": {
                    "duration": 20.0,
                    "temperature": 1.0,
                    "prompt_template": "{environment} sounds, natural {weather} ambience, {details}"
                },
                "tags": ["nature", "ambient", "environment", "sounds"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_public": True
            },
            "vocal_harmony": {
                "id": "vocal_harmony",
                "name": "Vocal Harmony",
                "description": "Multi-layer vocal harmonies and arrangements",
                "category": "music",
                "parameters": {
                    "duration": 25.0,
                    "model_size": "melody",
                    "temperature": 0.7,
                    "top_k": 180,
                    "cfg_coef": 3.5,
                    "prompt_template": "vocal harmony, {style} singing, {number} voices, {language} lyrics"
                },
                "tags": ["vocal", "harmony", "singing", "voices"],
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "is_public": True
            }
        }
        
        # Convert to Preset objects and save
        preset_objects = {
            preset_id: Preset(**preset_data)
            for preset_id, preset_data in default_presets.items()
        }
        
        save_presets(preset_objects)
        logger.info("✅ Default presets initialized")

# Initialize defaults on module load
initialize_default_presets()

@router.get("/", response_model=List[Preset])
async def list_presets(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    public_only: bool = True
):
    """List all presets with optional filtering"""
    
    presets = load_presets()
    
    # Convert to list
    preset_list = list(presets.values())
    
    # Apply filters
    if category:
        preset_list = [p for p in preset_list if p.category == category]
    
    if public_only:
        preset_list = [p for p in preset_list if p.is_public]
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        preset_list = [
            p for p in preset_list 
            if any(tag in p.tags for tag in tag_list)
        ]
    
    # Sort by name
    preset_list.sort(key=lambda x: x.name)
    
    logger.info(f"📋 Listed {len(preset_list)} presets")
    return preset_list

@router.get("/{preset_id}", response_model=Preset)
async def get_preset(preset_id: str):
    """Get specific preset by ID"""
    
    presets = load_presets()
    
    if preset_id not in presets:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    return presets[preset_id]

@router.post("/", response_model=Preset)
async def create_preset(request: CreatePresetRequest):
    """Create a new preset"""
    
    presets = load_presets()
    
    # Check if name already exists
    existing_names = [p.name for p in presets.values()]
    if request.name in existing_names:
        raise HTTPException(status_code=400, detail="Preset name already exists")
    
    # Generate unique ID
    preset_id = str(uuid.uuid4())
    
    # Create preset
    now = datetime.now().isoformat()
    new_preset = Preset(
        id=preset_id,
        name=request.name,
        description=request.description,
        category=request.category,
        parameters=request.parameters,
        created_at=now,
        updated_at=now,
        tags=request.tags,
        is_public=request.is_public
    )
    
    # Save
    presets[preset_id] = new_preset
    save_presets(presets)
    
    logger.info(f"✅ Preset created: {request.name} ({preset_id})")
    return new_preset

@router.put("/{preset_id}", response_model=Preset)
async def update_preset(preset_id: str, request: UpdatePresetRequest):
    """Update an existing preset"""
    
    presets = load_presets()
    
    if preset_id not in presets:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    preset = presets[preset_id]
    
    # Update fields
    if request.name is not None:
        # Check for name conflicts (excluding current preset)
        existing_names = [
            p.name for pid, p in presets.items() 
            if pid != preset_id
        ]
        if request.name in existing_names:
            raise HTTPException(status_code=400, detail="Preset name already exists")
        preset.name = request.name
    
    if request.description is not None:
        preset.description = request.description
    
    if request.parameters is not None:
        preset.parameters = request.parameters
    
    if request.tags is not None:
        preset.tags = request.tags
    
    if request.is_public is not None:
        preset.is_public = request.is_public
    
    preset.updated_at = datetime.now().isoformat()
    
    # Save
    presets[preset_id] = preset
    save_presets(presets)
    
    logger.info(f"📝 Preset updated: {preset.name} ({preset_id})")
    return preset

@router.delete("/{preset_id}")
async def delete_preset(preset_id: str):
    """Delete a preset"""
    
    presets = load_presets()
    
    if preset_id not in presets:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    preset_name = presets[preset_id].name
    del presets[preset_id]
    
    save_presets(presets)
    
    logger.info(f"🗑️ Preset deleted: {preset_name} ({preset_id})")
    return {"message": f"Preset '{preset_name}' deleted successfully"}

@router.post("/{preset_id}/duplicate", response_model=Preset)
async def duplicate_preset(preset_id: str, new_name: str):
    """Duplicate an existing preset with a new name"""
    
    presets = load_presets()
    
    if preset_id not in presets:
        raise HTTPException(status_code=404, detail="Preset not found")
    
    # Check if new name already exists
    existing_names = [p.name for p in presets.values()]
    if new_name in existing_names:
        raise HTTPException(status_code=400, detail="Preset name already exists")
    
    # Get original preset
    original = presets[preset_id]
    
    # Create duplicate
    duplicate_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    duplicate = Preset(
        id=duplicate_id,
        name=new_name,
        description=f"Copy of {original.description}" if original.description else None,
        category=original.category,
        parameters=original.parameters.copy(),
        created_at=now,
        updated_at=now,
        tags=original.tags.copy(),
        is_public=original.is_public
    )
    
    # Save
    presets[duplicate_id] = duplicate
    save_presets(presets)
    
    logger.info(f"📋 Preset duplicated: {original.name} -> {new_name}")
    return duplicate

@router.get("/categories/list")
async def list_categories():
    """List all preset categories with counts"""
    
    presets = load_presets()
    categories = {}
    
    for preset in presets.values():
        if preset.is_public:
            category = preset.category
            if category not in categories:
                categories[category] = {"count": 0, "presets": []}
            categories[category]["count"] += 1
            categories[category]["presets"].append({
                "id": preset.id,
                "name": preset.name
            })
    
    return categories

@router.get("/tags/list")
async def list_tags():
    """List all tags with usage counts"""
    
    presets = load_presets()
    tag_counts = {}
    
    for preset in presets.values():
        if preset.is_public:
            for tag in preset.tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
    
    # Sort by usage count
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "tags": [{"tag": tag, "count": count} for tag, count in sorted_tags],
        "total_tags": len(sorted_tags)
    }

@router.post("/export")
async def export_presets(preset_ids: Optional[List[str]] = None):
    """Export presets to JSON"""
    
    presets = load_presets()
    
    if preset_ids:
        # Export specific presets
        export_data = {
            pid: presets[pid].dict() 
            for pid in preset_ids 
            if pid in presets
        }
    else:
        # Export all public presets
        export_data = {
            pid: preset.dict() 
            for pid, preset in presets.items() 
            if preset.is_public
        }
    
    return {
        "presets": export_data,
        "exported_at": datetime.now().isoformat(),
        "count": len(export_data)
    }

@router.post("/import")
async def import_presets(import_data: Dict[str, Any]):
    """Import presets from JSON"""
    
    if "presets" not in import_data:
        raise HTTPException(status_code=400, detail="Invalid import format")
    
    presets = load_presets()
    imported_count = 0
    skipped_count = 0
    
    for preset_data in import_data["presets"].values():
        try:
            # Generate new ID to avoid conflicts
            preset_data["id"] = str(uuid.uuid4())
            preset_data["updated_at"] = datetime.now().isoformat()
            
            # Check for name conflicts
            existing_names = [p.name for p in presets.values()]
            original_name = preset_data["name"]
            counter = 1
            
            while preset_data["name"] in existing_names:
                preset_data["name"] = f"{original_name} ({counter})"
                counter += 1
            
            # Create preset object
            preset = Preset(**preset_data)
            presets[preset.id] = preset
            imported_count += 1
            
        except Exception as e:
            logger.warning(f"⚠️ Skipped invalid preset: {e}")
            skipped_count += 1
    
    # Save all presets
    save_presets(presets)
    
    logger.info(f"📥 Imported {imported_count} presets, skipped {skipped_count}")
    
    return {
        "message": f"Import completed",
        "imported": imported_count,
        "skipped": skipped_count
    }