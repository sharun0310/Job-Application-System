from typing import List, Dict, Any, Type
from app.live_job_search.providers.base_provider import AsyncJobProvider
from app.live_job_search.config import live_job_settings

class ProviderFactory:
    """
    Manages the lifecycle and routing of all Job Providers.
    Allows dynamic registration, enabling/disabling via config,
    and sorting by provider priority.
    """
    def __init__(self):
        self._providers: List[AsyncJobProvider] = []

    def register_provider(self, provider_class: Type[AsyncJobProvider], config: Any = None):
        """Instantiates and registers a provider if it is enabled in the config."""
        if config and not getattr(config, "enabled", True):
            return  # Skip disabled providers

        instance = provider_class(config=config)
        self._providers.append(instance)

    def get_active_providers(self) -> List[AsyncJobProvider]:
        """Returns all registered, enabled providers sorted by priority."""
        # Sort by priority (lower number = higher priority)
        return sorted(self._providers, key=lambda p: p.provider_metadata().priority)

provider_factory = ProviderFactory()
