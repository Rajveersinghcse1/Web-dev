"""
Advanced caching system for AI models
"""

import time
import threading
from typing import Any, Dict, Optional
from collections import OrderedDict
import logging

logger = logging.getLogger(__name__)

class ModelCache:
    """LRU cache for AI models with memory management"""
    
    def __init__(self, max_size: int = 3):
        self.max_size = max_size
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.lock = threading.RLock()
        
    def get(self, key: str) -> Optional[Any]:
        """Get model from cache"""
        with self.lock:
            if key in self.cache:
                # Move to end (most recently used)
                self.cache.move_to_end(key)
                item = self.cache[key]
                
                # Check if expired
                if time.time() - item['timestamp'] > item.get('ttl', 3600):
                    del self.cache[key]
                    logger.info(f"🗑️ Expired cache entry removed: {key}")
                    return None
                
                logger.info(f"📦 Cache hit: {key}")
                return item['model']
            
            logger.info(f"💥 Cache miss: {key}")
            return None
    
    def set(self, key: str, model: Any, ttl: int = 3600):
        """Store model in cache"""
        with self.lock:
            # Remove oldest if at capacity
            if len(self.cache) >= self.max_size and key not in self.cache:
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
                logger.info(f"🗑️ Evicted oldest cache entry: {oldest_key}")
            
            # Store model with metadata
            self.cache[key] = {
                'model': model,
                'timestamp': time.time(),
                'ttl': ttl
            }
            
            # Move to end
            self.cache.move_to_end(key)
            logger.info(f"💾 Cached model: {key}")
    
    def remove(self, key: str) -> bool:
        """Remove model from cache"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                logger.info(f"🗑️ Removed from cache: {key}")
                return True
            return False
    
    def clear(self):
        """Clear all cached models"""
        with self.lock:
            self.cache.clear()
            logger.info("🧹 Cache cleared")
    
    def size(self) -> int:
        """Get current cache size"""
        return len(self.cache)
    
    def keys(self) -> list:
        """Get all cache keys"""
        return list(self.cache.keys())
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.lock:
            return {
                'size': len(self.cache),
                'max_size': self.max_size,
                'keys': list(self.cache.keys()),
                'memory_usage': sum(
                    self._estimate_model_size(item['model']) 
                    for item in self.cache.values()
                )
            }
    
    def _estimate_model_size(self, model: Any) -> int:
        """Estimate model memory usage in bytes"""
        try:
            if hasattr(model, 'state_dict'):
                # PyTorch model
                total_params = sum(p.numel() for p in model.parameters())
                return total_params * 4  # Assuming float32
            else:
                # Fallback estimate
                return 100 * 1024 * 1024  # 100MB
        except:
            return 100 * 1024 * 1024  # 100MB fallback