from typing import List, Dict, Any
from app.live_job_search.providers.base_provider import AsyncJobProvider, ProviderMetadata
from app.live_job_search.schemas import LiveJobSchema

class LinkedInInterface(AsyncJobProvider):
    """
    Placeholder Interface for LinkedIn API integration.
    Currently disabled. Requires strict OAuth and partnership approval.
    """

    def provider_metadata(self) -> ProviderMetadata:
        return ProviderMetadata(
            name="LinkedIn",
            version="1.0",
            supports_remote=True,
            supports_salary=False,
            supports_pagination=True,
            rate_limit_per_minute=10, 
            requires_api_key=True,
            priority=100
        )

    def supports_filters(self) -> List[str]:
        return ["query", "location"]

    async def fetch_jobs(self, query: str, location: str, **kwargs) -> List[Dict[str, Any]]:
        # TODO: Implement LinkedIn OAuth and Profile matching
        return []

    def normalize(self, raw_job: Dict[str, Any]) -> LiveJobSchema:
        pass
