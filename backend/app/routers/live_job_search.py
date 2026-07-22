from fastapi import APIRouter, Depends
from typing import Optional

from app.utils.response import success_response, APIResponse
from app.live_job_search.engine import live_job_engine
from app.live_job_search.monitoring import monitoring_service

# For demo, you can require get_current_user if needed, 
# but search is often public or open to all logged-in users.
# from app.authentication.dependencies import get_current_user
# from app.models.user import User

router = APIRouter()

@router.get("/search", response_model=APIResponse)
async def search_live_jobs(
    query: Optional[str] = "",
    location: Optional[str] = "",
):
    """
    Triggers the high-concurrency Live Job Search Engine.
    Aggregates jobs from all enabled providers concurrently.
    """
    jobs = await live_job_engine.search(query, location)
    
    return success_response(
        data={
            "results_count": len(jobs),
            "jobs": [j.model_dump() for j in jobs]
        },
        message="Live search completed successfully."
    )

@router.get("/providers", response_model=APIResponse)
async def get_provider_health():
    """
    Returns the health status, latency, and circuit breaker status 
    of all registered providers.
    """
    health = await monitoring_service.get_providers_health()
    return success_response(
        data=health,
        message="Provider health fetched successfully."
    )

@router.get("/statistics", response_model=APIResponse)
async def get_search_statistics():
    """
    Global metrics and telemetry for the Live Job Search Engine.
    """
    stats = monitoring_service.get_global_statistics()
    return success_response(
        data=stats,
        message="Statistics fetched successfully."
    )
