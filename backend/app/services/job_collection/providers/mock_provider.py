import uuid
from typing import List, Dict, Any
from app.services.job_collection.base_provider import JobProvider


class MockJobProvider(JobProvider):
    """
    Mock Data Provider for development and testing.
    """

    def fetch_jobs(
        self, query: str, location: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        return [
            {
                "id": str(uuid.uuid4()),
                "source": "MockProvider",
                "job_title": f"Senior {query} Engineer",
                "company_name": "Tech Mock Corp",
                "job_location": location,
                "salary_range": "$120k - $150k",
                "type": "Full-Time",
                "skills_required": ["Python", "FastAPI", "PostgreSQL"],
                "job_description": "Looking for an experienced engineer to build scalable APIs.",
                "url": "https://example.com/jobs/1",
            }
        ]
