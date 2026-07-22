from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import httpx

from app.live_job_search.schemas import LiveJobSchema, ProviderHealth

class ProviderMetadata(BaseModel):
    name: str
    version: str = "1.0"
    supports_remote: bool = False
    supports_salary: bool = False
    supports_pagination: bool = False
    rate_limit_per_minute: int = 60
    requires_api_key: bool = False
    priority: int = 50

class AsyncJobProvider(ABC):
    """
    Abstract Base Class for all Live Job Providers.
    Forces all integrations to conform to a strict interface, ensuring
    the main search engine can process them uniformly asynchronously.
    """
    
    def __init__(self, config: Optional[Any] = None):
        self.config = config
        self._consecutive_failures = 0
        self._last_success_time: Optional[datetime] = None
        self._is_circuit_open = False
        
    @abstractmethod
    def provider_metadata(self) -> ProviderMetadata:
        """Return the static capabilities and settings of this provider."""
        pass
        
    @abstractmethod
    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Execute the HTTP request asynchronously to the provider's API.
        Must return a list of raw dictionaries from the provider.
        """
        pass
        
    @abstractmethod
    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        """
        Map the provider-specific raw dictionary to the Unified LiveJobSchema.
        """
        pass
        
    @abstractmethod
    def supports_filters(self) -> List[str]:
        """
        Return a list of filter keys (e.g., ['remote', 'salary']) that this 
        provider natively supports passing directly to its API.
        """
        pass

    async def health(self) -> ProviderHealth:
        """
        Default health check implementation. 
        Calculates latency and circuit breaker status.
        """
        status = "HEALTHY"
        if self._is_circuit_open:
            status = "DEGRADED"
            
        return ProviderHealth(
            name=self.provider_metadata().name,
            status=status,
            latency_ms=0.0,  # Will be populated by the Search Engine wrapper
            jobs_returned=0,
            last_sync=self._last_success_time or datetime.min,
            failure_count=self._consecutive_failures
        )
