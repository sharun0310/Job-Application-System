import asyncio
from typing import List, Dict, Any, Optional
import time

from app.live_job_search.schemas import LiveJobSchema
from app.live_job_search.provider_factory import provider_factory
from app.live_job_search.deduplicator import JobDeduplicator
from app.live_job_search.ranking_engine import RankingEngine
from app.live_job_search.cache import cache_manager
from app.live_job_search.config import live_job_settings

class LiveJobSearchEngine:
    """
    The Core Orchestrator. 
    Executes providers concurrently, handles partial failures safely,
    normalizes, deduplicates, and ranks jobs.
    """
    
    async def search(self, query: str, location: str) -> List[LiveJobSchema]:
        # 1. Check Cache
        cache_key = f"search_{query}_{location}".lower()
        cached_result = cache_manager.get(cache_key)
        if cached_result:
            # We must reconstruct Pydantic models from the cached dicts
            return [LiveJobSchema(**job) for job in cached_result]

        # 2. Get Active Providers
        providers = provider_factory.get_active_providers()
        if not providers:
            return []

        # 3. Concurrent Execution
        # We wrap each provider call in a safe async function that catches exceptions
        async def safe_fetch(provider):
            try:
                raw_jobs = await provider.fetch_jobs(query, location)
                return [provider.normalize(rj) for rj in raw_jobs]
            except Exception as e:
                # Log failure here via monitoring module
                print(f"Provider {provider.provider_metadata().name} failed: {e}")
                return []

        tasks = [safe_fetch(p) for p in providers]
        
        # asyncio.gather runs them all at once. 
        # return_exceptions=True prevents one failing provider from killing the gather
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_normalized_jobs: List[LiveJobSchema] = []
        for res in results:
            if isinstance(res, Exception):
                continue
            all_normalized_jobs.extend(res)

        # 4. Deduplicate
        unique_jobs = JobDeduplicator.deduplicate(all_normalized_jobs)

        # 5. Rank & Sort
        ranked_jobs = RankingEngine.rank_jobs(unique_jobs, query)

        # 6. Cache the Result (store as raw dicts)
        cache_manager.set(cache_key, [j.model_dump() for j in ranked_jobs])

        return ranked_jobs

live_job_engine = LiveJobSearchEngine()
