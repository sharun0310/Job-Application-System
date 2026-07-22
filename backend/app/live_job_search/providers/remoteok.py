from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class RemoteOKProvider(AsyncJobProvider):
    """
    Integration for RemoteOK public job API.
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="RemoteOK",
            version="1.0",
            supports_remote=True,
            supports_salary=False,
            supports_pagination=False,
            rate_limit_per_minute=30,
            requires_api_key=False,
            priority=self.config.priority if self.config else 20
        )

    def supports_filters(self) -> List[str]:
        return []

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        base_url = self.config.base_url if self.config and self.config.base_url else "https://remoteok.com/api"
        # RemoteOK requires specific User-Agent to avoid 403 Forbidden
        headers = {"User-Agent": "JobAutomationSystem/1.0 (contact@example.com)"}
        
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(base_url, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                # RemoteOK API usually returns metadata as the first element.
                jobs = [job for job in data if "legal" not in job]
                
                filtered_jobs = []
                for job in jobs:
                    title_match = not query or query.lower() in job.get("position", "").lower() or query.lower() in str(job.get("tags", [])).lower()
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
            job_id=str(raw_job.get("id")),
            title=raw_job.get("position", "Unknown"),
            company=raw_job.get("company", "Unknown"),
            company_logo=raw_job.get("company_logo"),
            location=raw_job.get("location", ""),
            remote=True,
            description=raw_job.get("description", ""),
            tags=raw_job.get("tags", []),
            apply_url=raw_job.get("apply_url") or raw_job.get("url", "https://remoteok.com"),
            source="RemoteOK API",
            provider=self.provider_metadata().name,
            posted_date=datetime.fromisoformat(raw_job.get("date").replace('Z', '+00:00')) if raw_job.get("date") else None
        )
