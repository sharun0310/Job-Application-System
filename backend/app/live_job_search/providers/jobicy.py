from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class JobicyProvider(AsyncJobProvider):
    """
    Integration for Jobicy public job API.
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="Jobicy",
            version="1.0",
            supports_remote=True,
            supports_salary=False,
            supports_pagination=False,
            rate_limit_per_minute=60,
            requires_api_key=False,
            priority=self.config.priority if self.config else 30
        )

    def supports_filters(self) -> List[str]:
        return []

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        base_url = self.config.base_url if self.config and self.config.base_url else "https://jobicy.com/api/v2/remote-jobs"
        
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(base_url)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                jobs = data.get("jobs", [])
                
                filtered_jobs = []
                for job in jobs:
                    title_match = not query or query.lower() in job.get("jobTitle", "").lower()
                    loc_match = not location or location.lower() in job.get("jobGeo", "").lower()
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
            job_id=str(raw_job.get("id")),
            title=raw_job.get("jobTitle", "Unknown"),
            company=raw_job.get("companyName", "Unknown"),
            company_logo=raw_job.get("companyLogo"),
            location=raw_job.get("jobGeo", ""),
            remote=True,
            description=raw_job.get("jobDescription", ""),
            apply_url=raw_job.get("url", "https://jobicy.com"),
            source="Jobicy API",
            provider=self.provider_metadata().name,
            job_type=raw_job.get("jobType"),
            posted_date=datetime.strptime(raw_job.get("pubDate"), "%Y-%m-%d %H:%M:%S") if raw_job.get("pubDate") else None
        )
