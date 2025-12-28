"""
GPU optimization utilities for AI models
"""

import torch
import logging
from typing import Any, Optional
import gc

logger = logging.getLogger(__name__)

class GPUOptimizer:
    """Advanced GPU optimization for AI models"""
    
    def __init__(self):
        self.device = None
        self.mixed_precision = False
        self.tensor_cores = False
        
    async def setup(self):
        """Setup GPU optimization"""
        if not torch.cuda.is_available():
            logger.warning("⚠️ CUDA not available, using CPU")
            self.device = torch.device("cpu")
            return
        
        self.device = torch.device("cuda")
        
        # Check for mixed precision support
        if torch.cuda.get_device_capability()[0] >= 7:  # Volta or newer
            self.mixed_precision = True
            self.tensor_cores = True
            logger.info("✅ Mixed precision and Tensor Cores enabled")
        
        # Optimize CUDA settings
        torch.backends.cudnn.benchmark = True
        torch.backends.cudnn.enabled = True
        
        # Memory optimization
        torch.cuda.empty_cache()
        
        logger.info(f"✅ GPU optimization setup complete: {torch.cuda.get_device_name()}")
    
    async def optimize_model(self, model: Any) -> Any:
        """Optimize model for GPU inference"""
        if self.device is None or not torch.cuda.is_available():
            return model
        
        try:
            # Move to GPU
            model = model.to(self.device)
            
            # Enable mixed precision if available
            if self.mixed_precision:
                model = model.half()  # Convert to FP16
                logger.info("✅ Model converted to FP16")
            
            # Compile model for faster inference (PyTorch 2.0+)
            if hasattr(torch, 'compile'):
                try:
                    model = torch.compile(model, mode="reduce-overhead")
                    logger.info("✅ Model compiled with torch.compile")
                except Exception as e:
                    logger.warning(f"⚠️ torch.compile failed: {e}")
            
            # Set to evaluation mode
            model.eval()
            
            # Enable memory efficient attention if available
            if hasattr(model, 'enable_xformers_memory_efficient_attention'):
                try:
                    model.enable_xformers_memory_efficient_attention()
                    logger.info("✅ Memory efficient attention enabled")
                except Exception as e:
                    logger.warning(f"⚠️ Memory efficient attention failed: {e}")
            
            logger.info("✅ Model optimization complete")
            return model
            
        except Exception as e:
            logger.error(f"❌ Model optimization failed: {e}")
            return model
    
    def optimize_tensor(self, tensor: torch.Tensor) -> torch.Tensor:
        """Optimize tensor for GPU operations"""
        if self.device is None or not torch.cuda.is_available():
            return tensor
        
        tensor = tensor.to(self.device)
        
        if self.mixed_precision and tensor.dtype == torch.float32:
            tensor = tensor.half()
        
        return tensor
    
    def clear_memory(self):
        """Clear GPU memory"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
            logger.info("🧹 GPU memory cleared")
    
    def get_memory_info(self) -> dict:
        """Get GPU memory information"""
        if not torch.cuda.is_available():
            return {"gpu_available": False}
        
        return {
            "gpu_available": True,
            "device_name": torch.cuda.get_device_name(),
            "memory_allocated": torch.cuda.memory_allocated(),
            "memory_reserved": torch.cuda.memory_reserved(),
            "max_memory_allocated": torch.cuda.max_memory_allocated(),
            "memory_free": torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_allocated(),
            "mixed_precision": self.mixed_precision,
            "tensor_cores": self.tensor_cores
        }
    
    def set_memory_fraction(self, fraction: float = 0.8):
        """Set GPU memory fraction to use"""
        if torch.cuda.is_available():
            torch.cuda.set_per_process_memory_fraction(fraction)
            logger.info(f"🎛️ GPU memory fraction set to {fraction}")
    
    @staticmethod
    def warm_up_gpu():
        """Warm up GPU with dummy operations"""
        if torch.cuda.is_available():
            # Create dummy tensors and perform operations
            x = torch.randn(1000, 1000, device="cuda")
            y = torch.randn(1000, 1000, device="cuda")
            z = torch.matmul(x, y)
            del x, y, z
            torch.cuda.synchronize()
            logger.info("🔥 GPU warmed up")

class TensorOptimizer:
    """Optimize tensor operations"""
    
    @staticmethod
    def optimize_for_inference(tensor: torch.Tensor) -> torch.Tensor:
        """Optimize tensor for inference"""
        # Ensure contiguous memory layout
        if not tensor.is_contiguous():
            tensor = tensor.contiguous()
        
        # Pin memory for faster CPU-GPU transfers
        if tensor.device.type == "cpu":
            tensor = tensor.pin_memory()
        
        return tensor
    
    @staticmethod
    def batch_tensors(tensors: list, max_batch_size: int = 4) -> list:
        """Batch tensors for efficient processing"""
        batches = []
        for i in range(0, len(tensors), max_batch_size):
            batch = tensors[i:i + max_batch_size]
            if len(batch) > 1:
                batches.append(torch.stack(batch))
            else:
                batches.append(batch[0])
        return batches