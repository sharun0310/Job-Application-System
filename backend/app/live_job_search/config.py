from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict, Any

class ProviderConfig(BaseSettings):
    """Configuration specific to a single Job Provider."""
    enabled: bool = True
    priority: int = 50  # Lower number = higher priority
    timeout_seconds: int = 10
    retry_count: int = 3
    rate_limit_per_minute: int = 60
    api_key: str | None = None
    base_url: str | None = None

class LiveJobSearchConfig(BaseSettings):
    """
    Global Configuration for the Live Job Search Engine.
    Utilizes Pydantic v2 BaseSettings to load from environment variables automatically.
    """
    model_config = SettingsConfigDict(env_prefix="LIVE_JOB_", env_file=".env", extra="ignore")

    # Global Engine Settings
    ENGINE_TIMEOUT_SECONDS: int = 15  # Max time the entire engine will wait
    CONCURRENCY_LIMIT: int = 20       # Max simultaneous provider requests
    
    # Caching
    USE_REDIS: bool = False           # Toggle to use Redis (if available) or fallback to In-Memory
    CACHE_TTL_SECONDS: int = 300      # 5 minutes default TTL for job search responses
    
    # Provider-Specific Configurations (Loaded via environment variables like LIVE_JOB_ADZUNA_API_KEY)
    # These act as defaults that can be overridden.
    ADZUNA: ProviderConfig = ProviderConfig(priority=10, base_url="https://api.adzuna.com/v1/api")
    REMOTEOK: ProviderConfig = ProviderConfig(priority=20, base_url="https://remoteok.com/api")
    REMOTIVE: ProviderConfig = ProviderConfig(priority=20, base_url="https://remotive.com/api/remote-jobs")
    ARBEITNOW: ProviderConfig = ProviderConfig(priority=30, base_url="https://www.arbeitnow.com/api/job-board-api")
    JOBICY: ProviderConfig = ProviderConfig(priority=30, base_url="https://jobicy.com/api/v2/remote-jobs")
    USAJOBS: ProviderConfig = ProviderConfig(priority=40, base_url="https://data.usajobs.gov/api/search")
    
    # India & Global Providers
    LINKEDIN: ProviderConfig = ProviderConfig(enabled=False, priority=100)
    INDEED: ProviderConfig = ProviderConfig(enabled=True, priority=5)

live_job_settings = LiveJobSearchConfig()
