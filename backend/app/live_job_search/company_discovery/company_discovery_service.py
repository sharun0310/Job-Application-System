from app.live_job_search.provider_factory import provider_factory
from app.live_job_search.company_discovery.company_registry import COMPANY_REGISTRY
from app.live_job_search.company_discovery.adapters.greenhouse_company import GreenhouseCompanyAdapter
# Future imports for lever, workable, etc.

class CompanyDiscoveryService:
    """
    Reads the company registry and automatically injects dynamically configured
    ATS adapters into the global ProviderFactory.
    """
    
    @staticmethod
    def register_all_companies():
        for company in COMPANY_REGISTRY:
            if not company.enabled:
                continue
                
            adapter = None
            if company.ats_platform.lower() == "greenhouse":
                adapter = GreenhouseCompanyAdapter(company)
            elif company.ats_platform.lower() == "lever":
                # We do a local import to avoid circular dependencies if needed, 
                # or import at top. Let's do local for dynamic loading simplicity.
                from app.live_job_search.company_discovery.adapters.lever_company import LeverCompanyAdapter
                adapter = LeverCompanyAdapter(company)
            # Add other platforms here as they are implemented
            
            if adapter:
                # We inject it directly into the factory list
                provider_factory._providers.append(adapter)

company_discovery_service = CompanyDiscoveryService()
