import time
from typing import Any, Dict, Optional
from app.live_job_search.config import live_job_settings
import json

class CacheManager:
    """
    Dual-layer Cache Manager. 
    Attempts Redis (if configured and available), falls back to in-memory dictionary.
    """
    def __init__(self):
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self.use_redis = live_job_settings.USE_REDIS
        self.ttl = live_job_settings.CACHE_TTL_SECONDS
        
        # Placeholder for Redis connection if we were to import redis
        self.redis_client = None 

    def get(self, key: str) -> Optional[Any]:
        if self.use_redis and self.redis_client:
            # Redis logic would go here
            pass
            
        # Fallback to Memory
        cached = self._memory_cache.get(key)
        if cached:
            if time.time() - cached['timestamp'] < self.ttl:
                return cached['data']
            else:
                del self._memory_cache[key]
        return None

    def set(self, key: str, data: Any):
        if self.use_redis and self.redis_client:
            # Redis logic would go here
            pass
            
        # Fallback to Memory
        self._memory_cache[key] = {
            'timestamp': time.time(),
            'data': data
        }

cache_manager = CacheManager()
