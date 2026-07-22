from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class USAJobsProvider(AsyncJobProvider):
    """
    Integration for the official USAJobs API.
    Requires an API Key (Authorization-Key header) and User-Agent (typically an email).
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="USAJobs",
            version="1.0",
            supports_remote=True,
            supports_salary=True,
            supports_pagination=True,
            rate_limit_per_minute=100, 
            requires_api_key=True,
            priority=self.config.priority if self.config else 40
        )

    def supports_filters(self) -> List[str]:
        return ["query", "location"]

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        if not self.config or not self.config.api_key:
            return []

        base_url = self.config.base_url or "https://data.usajobs.gov/api/search"
        
        headers = {
            "Host": "data.usajobs.gov",
            "User-Agent": "contact@example.com", # In production, replace with actual user agent/email
            "Authorization-Key": self.config.api_key
        }
        
        params = {}
        if query:
            params["Keyword"] = query
        if location:
            params["LocationName"] = location
            
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(base_url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                search_result = data.get("SearchResult", {})
                return search_result.get("SearchResultItems", [])
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= (self.config.retry_count if self.config else 3):
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        job_data = raw_job.get("MatchedObjectDescriptor", {})
        
        # Location processing
        locations = job_data.get("PositionLocation", [])
        location_str = locations[0].get("LocationName", "") if locations else ""
        
        # Salary processing
        salary_min = None
        salary_max = None
        remuneration = job_data.get("PositionRemuneration", [])
        if remuneration:
            try:
                salary_min = float(remuneration[0].get("MinimumRange"))
                salary_max = float(remuneration[0].get("MaximumRange"))
            except (ValueError, TypeError):
                pass
                
        return LiveJobSchema(
            job_id=str(job_data.get("PositionID")),
            title=job_data.get("PositionTitle", "Unknown"),
            company=job_data.get("OrganizationName", "US Government"),
            location=location_str,
            remote="Remote" in location_str or "Anywhere" in location_str,
            description=job_data.get("UserArea", {}).get("Details", {}).get("JobSummary", ""),
            salary_min=salary_min,
            salary_max=salary_max,
            apply_url=job_data.get("PositionURI", "https://usajobs.gov"),
            source="USAJobs",
            provider=self.provider_metadata().name,
            posted_date=datetime.fromisoformat(job_data.get("PublicationStartDate").replace('Z', '+00:00')) if job_data.get("PublicationStartDate") else None,
            expiration_date=datetime.fromisoformat(job_data.get("ApplicationCloseDate").replace('Z', '+00:00')) if job_data.get("ApplicationCloseDate") else None
        )
