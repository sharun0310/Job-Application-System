from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import ProviderMetadata
from app.live_job_search.company_discovery.base_company_provider import BaseCompanyProvider
from app.live_job_search.schemas import LiveJobSchema
from app.live_job_search.company_discovery.company_registry import CompanyConfig

class LeverCompanyAdapter(BaseCompanyProvider):
    """
    Adapter for scraping/fetching jobs from public Lever boards.
    Endpoint: https://api.lever.co/v0/postings/{board_token}
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
        base_url = f"https://api.lever.co/v0/postings/{self.company_config.board_token}"
        
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.get(base_url)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                filtered_jobs = []
                for job in data:
                    title_match = not query or query.lower() in job.get("text", "").lower()
                    loc_match = not location or location.lower() in job.get("categories", {}).get("location", "").lower()
                    if title_match and loc_match:
                        filtered_jobs.append(job)
                        
                return filtered_jobs
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= 3:
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        loc = raw_job.get("categories", {}).get("location", "")
        return LiveJobSchema(
            job_id=str(raw_job.get("id")),
            title=raw_job.get("text", "Unknown"),
            company=self.company_config.name,
            location=loc,
            remote="remote" in loc.lower(),
            description=raw_job.get("descriptionPlain", ""), 
            apply_url=raw_job.get("hostedUrl", self.company_config.career_url),
            company_url=self.company_config.career_url,
            source="Lever",
            provider=self.provider_name,
            posted_date=datetime.fromtimestamp(raw_job.get("createdAt") / 1000.0) if raw_job.get("createdAt") else None
        )
