from typing import Optional
from app.live_job_search.providers.base_provider import AsyncJobProvider
from app.live_job_search.company_discovery.company_registry import CompanyConfig

class BaseCompanyProvider(AsyncJobProvider):
    """
    Extends the AsyncJobProvider to handle company-specific data dynamically.
    Instead of hardcoding the provider name, it injects the company's name and board token.
    """
    
    def __init__(self, company_config: CompanyConfig):
        super().__init__() # We aren't using the global config for these
        self.company_config = company_config
        self.provider_name = f"{self.company_config.name} ({self.company_config.ats_platform.title()})"
