from abc import ABC, abstractmethod
from typing import List, Dict, Any


class JobProvider(ABC):
    """
    Base interface for all Job Providers (LinkedIn, Indeed, Mock, etc.).
    This ensures that data providers can be added/removed without changing core logic.
    """

    @abstractmethod
    def fetch_jobs(
        self, query: str, location: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch raw job postings from the external provider.
        """
