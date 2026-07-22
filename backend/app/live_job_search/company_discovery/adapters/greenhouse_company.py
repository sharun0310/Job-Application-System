from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import ProviderMetadata
from app.live_job_search.company_discovery.base_company_provider import BaseCompanyProvider
from app.live_job_search.schemas import LiveJobSchema
from app.live_job_search.company_discovery.company_registry import CompanyConfig

class GreenhouseCompanyAdapter(BaseCompanyProvider):
    """
    Adapter for scraping/fetching jobs from public Greenhouse boards.
    Endpoint: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs
    """
    def __init__(self, company_config: CompanyConfig):
        super().__init__(company_config)

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name=self.provider_name,
            version="1.0",
            supports_remote=False,
            supports_salary=False,
            supports_pagination=False,
            rate_limit_per_minute=60,
            requires_api_key=False,
            priority=self.company_config.priority
        )

    def supports_filters(self) -> List[str]:
        return []

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        # The Greenhouse public board API requires the board token
        base_url = f"https://boards-api.greenhouse.io/v1/boards/{self.company_config.board_token}/jobs"
        
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.get(base_url)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                jobs = data.get("jobs", [])
                
                filtered_jobs = []
                for job in jobs:
                    title_match = not query or query.lower() in job.get("title", "").lower()
                    loc_match = not location or location.lower() in job.get("location", {}).get("name", "").lower()
                    if title_match and loc_match:
                        filtered_jobs.append(job)
                        
                return filtered_jobs
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= 3:
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        return LiveJobSchema(
            job_id=str(raw_job.get("id")),
            title=raw_job.get("title", "Unknown"),
            company=self.company_config.name,
            location=raw_job.get("location", {}).get("name", ""),
            remote="remote" in raw_job.get("location", {}).get("name", "").lower(),
            description="", # Greenhouse /jobs endpoint often doesn't include full description without calling the specific job ID
            apply_url=raw_job.get("absolute_url", self.company_config.career_url),
            company_url=self.company_config.career_url,
            source="Greenhouse",
            provider=self.provider_name,
            posted_date=datetime.fromisoformat(raw_job.get("updated_at").replace('Z', '+00:00')) if raw_job.get("updated_at") else None
        )
