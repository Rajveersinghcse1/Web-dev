"""
Advanced Model Manager with optimized loading and caching
"""

import asyncio
import logging
import threading
import time
from typing import Dict, Optional, Any, Tuple
from concurrent.futures import ThreadPoolExecutor
import torch
import gc
import psutil

from audiocraft.models import MusicGen, AudioGen
from app.core.config import settings
from app.utils.cache import ModelCache
from app.utils.gpu_optimizer import GPUOptimizer

logger = logging.getLogger(__name__)

class ModelManager:
    """Advanced model manager with caching and optimization"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_cache = ModelCache(max_size=settings.MODEL_CACHE_SIZE)
        self.gpu_optimizer = GPUOptimizer()
        self.executor = ThreadPoolExecutor(max_workers=settings.NUM_WORKERS)
        self.generation_semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_GENERATIONS)
        self.is_initialized = False
        self.lock = threading.RLock()
        
    async def initialize(self, load_default_model: bool = False):
        """Initialize models and optimizations"""
        logger.info("🔄 Initializing AI models...")
        
        try:
            # Setup GPU optimization
            if settings.ENABLE_GPU and torch.cuda.is_available():
                await self.gpu_optimizer.setup()
                logger.info(f"✅ GPU optimization enabled: {torch.cuda.get_device_name()}")
            else:
                logger.info("ℹ️ Running on CPU")
            
            # Optionally load default model
            if load_default_model:
                await self._load_default_model()
                # Warm up models
                await self._warmup_models()
            
            self.is_initialized = True
            logger.info("✅ Model manager initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize model manager: {e}")
            raise

    async def _load_default_model(self):
        """Load the default MusicGen model"""
        model_name = settings.DEFAULT_MODEL_SIZE
        await self.load_musicgen_model(model_name)

    async def load_musicgen_model(self, model_size: str = "small") -> MusicGen:
        """Load MusicGen model with caching and optimization"""
        
        if model_size not in settings.MUSICGEN_MODELS:
            raise ValueError(f"Unsupported model size: {model_size}")
        
        model_key = f"musicgen_{model_size}"
        
        # Check cache first
        cached_model = self.model_cache.get(model_key)
        if cached_model:
            logger.info(f"📦 Using cached MusicGen {model_size} model")
            return cached_model
        
        logger.info(f"🔄 Loading MusicGen {model_size} model...")
        
        try:
            # Load model in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            model = await loop.run_in_executor(
                self.executor,
                self._load_musicgen_sync,
                model_size
            )
            
            # Optimize model
            if settings.ENABLE_GPU and torch.cuda.is_available():
                model = await self.gpu_optimizer.optimize_model(model)
            
            # Cache the model
            self.model_cache.set(model_key, model)
            self.models[model_key] = model
            
            logger.info(f"✅ MusicGen {model_size} model loaded and optimized")
            return model
            
        except Exception as e:
            logger.error(f"❌ Failed to load MusicGen {model_size} model: {e}")
            raise

    def _load_musicgen_sync(self, model_size: str) -> MusicGen:
        """Synchronous model loading"""
        model_path = settings.MUSICGEN_MODELS[model_size]
        
        # Clear memory before loading
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        
        model = MusicGen.get_pretrained(model_path)
        
        # AudioCraft MusicGen models are automatically in eval mode
        # No need to call model.eval() as it's not a direct PyTorch model
        if hasattr(model, 'compression_model') and model.compression_model is not None:
            model.compression_model.eval()
        if hasattr(model, 'condition_model') and model.condition_model is not None:
            model.condition_model.eval()
        
        return model

    async def load_audiogen_model(self) -> AudioGen:
        """Load AudioGen model for sound effects"""
        
        model_key = "audiogen"
        
        # Check cache
        cached_model = self.model_cache.get(model_key)
        if cached_model:
            logger.info("📦 Using cached AudioGen model")
            return cached_model
        
        logger.info("🔄 Loading AudioGen model...")
        
        try:
            loop = asyncio.get_event_loop()
            model = await loop.run_in_executor(
                self.executor,
                self._load_audiogen_sync
            )
            
            # Optimize model
            if settings.ENABLE_GPU and torch.cuda.is_available():
                model = await self.gpu_optimizer.optimize_model(model)
            
            # Cache the model
            self.model_cache.set(model_key, model)
            self.models[model_key] = model
            
            logger.info("✅ AudioGen model loaded and optimized")
            return model
            
        except Exception as e:
            logger.error(f"❌ Failed to load AudioGen model: {e}")
            raise

    def _load_audiogen_sync(self) -> AudioGen:
        """Synchronous AudioGen loading"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        
        model = AudioGen.get_pretrained(settings.AUDIOGEN_MODEL)
        
        # AudioCraft AudioGen models are automatically in eval mode
        # No need to call model.eval() as it's not a direct PyTorch model
        if hasattr(model, 'compression_model') and model.compression_model is not None:
            model.compression_model.eval()
        if hasattr(model, 'condition_model') and model.condition_model is not None:
            model.condition_model.eval()
        
        return model

    async def generate_music(
        self,
        prompt: str,
        duration: float = 10.0,
        model_size: str = "small",
        temperature: float = 1.0,
        top_k: int = 250,
        top_p: float = 0.0,
        cfg_coef: float = 3.0,
        **kwargs
    ) -> Tuple[torch.Tensor, int]:
        """Generate music with advanced parameters"""
        
        async with self.generation_semaphore:
            # Validate parameters
            duration = min(duration, settings.MAX_DURATION)
            
            # Use thread-safe model loading
            with self.lock:
                # Get or load model
                model = await self.load_musicgen_model(model_size)
                
                # Set generation parameters
                model.set_generation_params(
                    duration=duration,
                    temperature=temperature,
                    top_k=top_k,
                    top_p=top_p,
                    cfg_coef=cfg_coef,
                    **kwargs
                )
            
            logger.info(f"🎵 Generating music: '{prompt}' ({duration}s)")
            
            try:
                # Generate in thread pool with proper model isolation
                loop = asyncio.get_event_loop()
                start_time = time.time()
                
                wav = await loop.run_in_executor(
                    self.executor,
                    self._generate_music_sync,
                    model,
                    prompt
                )
                
                generation_time = time.time() - start_time
                logger.info(f"✅ Music generated in {generation_time:.2f}s")
                
                return wav, model.sample_rate
                
            except Exception as e:
                logger.error(f"❌ Music generation failed: {e}")
                raise

    def _generate_music_sync(self, model: MusicGen, prompt: str) -> torch.Tensor:
        """Synchronous music generation"""
        with torch.no_grad():
            # Clear any cached states to prevent 'past_values' error
            if hasattr(model, 'compression_model') and hasattr(model.compression_model, 'clear_cache'):
                model.compression_model.clear_cache()
            
            # Reset generation state
            if hasattr(model, '_init_generation'):
                model._init_generation()
                
            if isinstance(prompt, str):
                prompts = [prompt]
            else:
                prompts = prompt
                
            # Force garbage collection before generation
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
                
            wav = model.generate(prompts)
            return wav

    async def generate_audio_effect(
        self,
        prompt: str,
        duration: float = 5.0,
        **kwargs
    ) -> Tuple[torch.Tensor, int]:
        """Generate audio effects using AudioGen"""
        
        async with self.generation_semaphore:
            duration = min(duration, settings.MAX_DURATION)
            
            model = await self.load_audiogen_model()
            model.set_generation_params(duration=duration, **kwargs)
            
            logger.info(f"🔊 Generating audio effect: '{prompt}' ({duration}s)")
            
            try:
                loop = asyncio.get_event_loop()
                start_time = time.time()
                
                wav = await loop.run_in_executor(
                    self.executor,
                    self._generate_audio_sync,
                    model,
                    prompt
                )
                
                generation_time = time.time() - start_time
                logger.info(f"✅ Audio effect generated in {generation_time:.2f}s")
                
                return wav, model.sample_rate
                
            except Exception as e:
                logger.error(f"❌ Audio effect generation failed: {e}")
                raise

    def _generate_audio_sync(self, model: AudioGen, prompt: str) -> torch.Tensor:
        """Synchronous audio effect generation"""
        with torch.no_grad():
            if isinstance(prompt, str):
                prompts = [prompt]
            else:
                prompts = prompt
                
            wav = model.generate(prompts)
            return wav

    async def _warmup_models(self):
        """Warm up models with test generations"""
        logger.info("🔥 Warming up models...")
        
        try:
            # Warm up MusicGen
            model = await self.load_musicgen_model(settings.DEFAULT_MODEL_SIZE)
            await self.generate_music("test", duration=1.0)
            
            logger.info("✅ Models warmed up successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Model warmup failed: {e}")

    def get_memory_usage(self) -> Dict[str, Any]:
        """Get current memory usage statistics"""
        memory_info = {
            "system_memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "percent": psutil.virtual_memory().percent
            },
            "models_loaded": len(self.models),
            "cache_size": len(self.model_cache.cache)
        }
        
        if torch.cuda.is_available():
            memory_info["gpu_memory"] = {
                "allocated": torch.cuda.memory_allocated(),
                "cached": torch.cuda.memory_reserved(),
                "max_allocated": torch.cuda.max_memory_allocated()
            }
        
        return memory_info

    def is_ready(self) -> bool:
        """Check if model manager is ready"""
        return self.is_initialized and len(self.models) > 0

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Cleaning up model manager...")
        
        # Clear models
        self.models.clear()
        self.model_cache.clear()
        
        # Clear GPU memory
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Force garbage collection
        gc.collect()
        
        # Shutdown executor
        self.executor.shutdown(wait=True)
        
        logger.info("✅ Model manager cleanup complete")