from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class CompanyConfig(BaseModel):
    """
    Configuration for a specific company's ATS integration.
    """
    name: str
    board_token: str
    ats_platform: str  # e.g., 'greenhouse', 'lever', 'ashby'
    career_url: HttpUrl
    country: Optional[str] = None
    industry: Optional[str] = None
    enabled: bool = True
    priority: int = 50

# Central registry of all tracked companies
COMPANY_REGISTRY: List[CompanyConfig] = [
    # Example companies (Can be loaded from DB or JSON in production)
    CompanyConfig(
        name="Canonical",
        board_token="canonical",
        ats_platform="greenhouse",
        career_url="https://careers.canonical.com/",
        industry="Technology",
        priority=40
    ),
    CompanyConfig(
        name="GitLab",
        board_token="gitlab",
        ats_platform="greenhouse",
        career_url="https://about.gitlab.com/jobs/",
        industry="Technology",
        priority=40
    ),
]
