from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.authentication.dependencies import get_current_user
from app.models.user import User
from app.services.matching_service import MatchingService
from app.utils.response import success_response
from typing import List

router = APIRouter()


@router.get("/jobs/recommended", response_model=dict)
def get_recommended_jobs(
    top_k: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jobs = MatchingService.get_recommended_jobs(db, current_user.id, top_k)
    return success_response(data=jobs, message="Recommended jobs fetched successfully")


@router.get("/skill-gap/{job_id}", response_model=dict)
def get_skill_gap(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = MatchingService.analyze_skill_gap(db, current_user.id, job_id)
    return success_response(data=analysis, message="Skill gap analysis complete")


@router.post("/learning-roadmap", response_model=dict)
def get_learning_roadmap(
    missing_skills: List[str],
    target_role: str,
    current_user: User = Depends(get_current_user),
):
    roadmap = MatchingService.generate_learning_roadmap(missing_skills, target_role)
    return success_response(
        data=roadmap, message="Learning roadmap generated successfully"
    )
