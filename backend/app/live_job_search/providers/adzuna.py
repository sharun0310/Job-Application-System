from typing import List, Dict, Any
import httpx
from datetime import datetime

from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class AdzunaProvider(AsyncJobProvider):
    """
    Integration for Adzuna public job API.
    Requires an app_id and app_key (provided via config api_key as 'app_id:app_key').
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="Adzuna",
            version="1.0",
            supports_remote=False, # Remote is complex in Adzuna, treated as location
            supports_salary=True,
            supports_pagination=True,
            rate_limit_per_minute=250, # Typical Adzuna free tier
            requires_api_key=True,
            priority=self.config.priority if self.config else 10
        )

    def supports_filters(self) -> List[str]:
        return ["query", "location"]

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        # Adzuna requires authentication
        if not self.config or not self.config.api_key:
            # Skip gracefully if not configured
            return []
            
        try:
            app_id, app_key = self.config.api_key.split(":", 1)
        except ValueError:
            print("Adzuna API Key must be in format 'app_id:app_key'")
            return []

        base_url = self.config.base_url or "https://api.adzuna.com/v1/api"
        
        # Dynamic country selection logic
        country = "us"
        loc_str = (location or "").lower().strip()
        
        india_keywords = ["india", "bangalore", "bengaluru", "mumbai", "delhi", "hyderabad", "chennai", "pune", "noida", "gurgaon", "gurugram", "kolkata", "in"]
        uk_keywords = ["uk", "united kingdom", "london", "manchester", "gb"]
        
        if any(k in loc_str for k in india_keywords):
            country = "in"
        elif any(k in loc_str for k in uk_keywords):
            country = "gb"

        endpoint = f"{base_url}/jobs/{country}/search/1"
        params = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": 20
        }
        
        if query:
            params["what"] = query
        if location:
            params["where"] = location
            
        async with httpx.AsyncClient(timeout=self.config.timeout_seconds if self.config else 10) as client:
            try:
                response = await client.get(endpoint, params=params)
                response.raise_for_status()
                data = response.json()
                
                self._last_success_time = datetime.utcnow()
                self._consecutive_failures = 0
                
                return data.get("results", [])
                
            except Exception as e:
                self._consecutive_failures += 1
                if self._consecutive_failures >= (self.config.retry_count if self.config else 3):
                    self._is_circuit_open = True
                raise e

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        company_obj = raw_job.get("company", {})
        location_obj = raw_job.get("location", {})
        
        return LiveJobSchema(
            job_id=str(raw_job.get("id")),
            title=raw_job.get("title", "Unknown").replace("<strong>", "").replace("</strong>", ""),
            company=company_obj.get("display_name", "Unknown"),
            location=location_obj.get("display_name", ""),
            remote=False, 
            description=raw_job.get("description", ""),
            salary_min=raw_job.get("salary_min"),
            salary_max=raw_job.get("salary_max"),
            apply_url=raw_job.get("redirect_url", "https://adzuna.com"),
            source="Adzuna",
            provider=self.provider_metadata().name,
            posted_date=datetime.fromisoformat(raw_job.get("created").replace('Z', '+00:00')) if raw_job.get("created") else None
        )
