from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class RemotiveProvider(AsyncJobProvider):
    """
    Integration for Remotive public job API.
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="Remotive",
            version="1.0",
            supports_remote=True,
            supports_salary=True,
            supports_pagination=False,
            rate_limit_per_minute=60,
            requires_api_key=False,
            priority=self.config.priority if self.config else 20
        )

    def supports_filters(self) -> List[str]:
        return ["query"]

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        base_url = self.config.base_url if self.config and self.config.base_url else "https://remotive.com/api/remote-jobs"
        params = {}
        if query:
            params["search"] = query
            
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                jobs = data.get("jobs", [])
                
                if location:
                    # Filter manually by location string
                    jobs = [j for j in jobs if location.lower() in j.get("candidate_required_location", "").lower()]
                    
                return jobs
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= (self.config.retry_count if self.config else 3):
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        return LiveJobSchema(
            job_id=str(raw_job.get("id")),
            title=raw_job.get("title", "Unknown"),
            company=raw_job.get("company_name", "Unknown"),
            company_logo=raw_job.get("company_logo"),
            location=raw_job.get("candidate_required_location", ""),
            remote=True, # Remotive is remote-only
            description=raw_job.get("description", ""),
            tags=raw_job.get("tags", []),
            apply_url=raw_job.get("url", "https://remotive.com"),
            source="Remotive API",
            provider=self.provider_metadata().name,
            job_type=raw_job.get("job_type"),
            posted_date=datetime.fromisoformat(raw_job.get("publication_date").replace('Z', '+00:00')) if raw_job.get("publication_date") else None
        )
