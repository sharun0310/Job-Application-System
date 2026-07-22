from typing import List, Dict, Set
import hashlib
from app.live_job_search.schemas import LiveJobSchema

class JobDeduplicator:
    """
    Handles removing duplicate job postings aggregated from multiple providers.
    Uses MD5 hashing of specific fields to ensure fast uniqueness checks.
    """
    
    @staticmethod
    def deduplicate(jobs: List[LiveJobSchema]) -> List[LiveJobSchema]:
        unique_jobs: List[LiveJobSchema] = []
        seen_hashes: Set[str] = set()

        for job in jobs:
            # Create a unique signature based on Company Name + Job Title
            signature = f"{job.company.lower().strip()}_{job.title.lower().strip()}"
            job_hash = hashlib.md5(signature.encode('utf-8')).hexdigest()

            if job_hash not in seen_hashes:
                seen_hashes.add(job_hash)
                unique_jobs.append(job)

        return unique_jobs
