from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.authentication.dependencies import get_current_admin
from app.utils.response import success_response, APIResponse
from app.services.job_collection.collector import JobCollectorService
from app.services.job_collection.providers.mock_provider import MockJobProvider

router = APIRouter()

# Initialize the collector and register providers
collector_service = JobCollectorService()
collector_service.register_provider(MockJobProvider())

@router.post("/collect", response_model=APIResponse)
def trigger_job_collection(
    query: str,
    location: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Triggers job collection from all registered providers, saves them to PostgreSQL,
    and generates embeddings for AI Semantic Matching.
    """
    unique_jobs = collector_service.collect_jobs(query, location, db=db)
    
    return success_response(
        data={
            "collected_count": len(unique_jobs),
            "jobs": unique_jobs
        },
        message="Job collection completed successfully."
    )
