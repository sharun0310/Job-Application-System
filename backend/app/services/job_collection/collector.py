from typing import List, Dict, Any
from app.services.job_collection.base_provider import JobProvider
import hashlib


class JobCollectorService:
    """
    Orchestrates the collection of jobs from various registered providers.
    Follows: Collect -> Normalize -> Duplicate Removal -> Save.
    """

    def __init__(self):
        self._providers: List[JobProvider] = []

    def register_provider(self, provider: JobProvider):
        self._providers.append(provider)

    def collect_jobs(self, query: str, location: str) -> List[Dict[str, Any]]:
        raw_jobs = []
        for provider in self._providers:
            # 1. Collect
            raw_jobs.extend(provider.fetch_jobs(query, location))

        # 2. Normalize
        normalized_jobs = self._normalize(raw_jobs)

        # 3. Remove Duplicates
        unique_jobs = self._remove_duplicates(normalized_jobs)

        # 4. Generate Embeddings & Save to DB (To be implemented with ChromaDB/SQLAlchemy)
        return unique_jobs

    def _normalize(self, raw_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Map disparate fields to a unified schema
        normalized = []
        for job in raw_jobs:
            normalized.append(
                {
                    "title": job.get("job_title", job.get("title")),
                    "company": job.get("company_name", job.get("company")),
                    "location": job.get("job_location", job.get("location")),
                    "description": job.get("job_description", job.get("description")),
                    "skills_required": job.get("skills_required", []),
                    "url": job.get("url", ""),
                }
            )
        return normalized

    def _remove_duplicates(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_hashes = set()
        unique_jobs = []
        for job in jobs:
            # Create a simple hash based on title + company to detect dupes
            unique_string = f"{job['title']}_{job['company']}".lower()
            job_hash = hashlib.md5(unique_string.encode()).hexdigest()

            if job_hash not in seen_hashes:
                seen_hashes.add(job_hash)
                unique_jobs.append(job)

        return unique_jobs
