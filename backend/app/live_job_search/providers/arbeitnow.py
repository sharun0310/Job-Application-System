from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class ArbeitnowProvider(AsyncJobProvider):
    """
    Integration for Arbeitnow public job API.
    Does not require an API key.
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="Arbeitnow",
            version="1.0",
            supports_remote=True,
            supports_salary=False,
            supports_pagination=True,
            rate_limit_per_minute=120,
            requires_api_key=False,
            priority=self.config.priority if self.config else 30
        )

    def supports_filters(self) -> List[str]:
        return [] # No advanced query filters supported directly by this open API

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        base_url = self.config.base_url if self.config and self.config.base_url else "https://www.arbeitnow.com/api/job-board-api"
        
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(base_url)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                # Manual filtering since the API doesn't support query parameters natively
                jobs = data.get("data", [])
                
                filtered_jobs = []
                for job in jobs:
                    title_match = not query or query.lower() in job.get("title", "").lower()
                    loc_match = not location or location.lower() in job.get("location", "").lower()
                    if title_match and loc_match:
                        filtered_jobs.append(job)
                        
                return filtered_jobs
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= (self.config.retry_count if self.config else 3):
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        return LiveJobSchema(
            job_id=str(raw_job.get("slug")),
            title=raw_job.get("title", "Unknown"),
            company=raw_job.get("company_name", "Unknown"),
            location=raw_job.get("location", ""),
            remote=raw_job.get("remote", False),
            description=raw_job.get("description", ""),
            tags=raw_job.get("tags", []),
            apply_url=raw_job.get("url", "https://arbeitnow.com"),
            source="Arbeitnow API",
            provider=self.provider_metadata().name,
            job_type=raw_job.get("job_types", [None])[0] if raw_job.get("job_types") else None,
            posted_date=datetime.fromtimestamp(raw_job.get("created_at")) if raw_job.get("created_at") else None
        )
