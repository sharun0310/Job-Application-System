from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.authentication.dependencies import get_current_user
from app.models.user import User
from app.services.matching_service import MatchingService
from app.utils.response import success_response
from typing import List
from app.utils.response import APIResponse
router = APIRouter()


@router.get("/jobs/recommended", response_model=APIResponse)
def get_recommended_jobs(
    top_k: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jobs = MatchingService.get_recommended_jobs(db, current_user.id, top_k)
    return success_response(data=jobs, message="Recommended jobs fetched successfully")


from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import logging

@router.get("/skill-gap/{job_id}", response_model=APIResponse)
def get_skill_gap(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        analysis = MatchingService.analyze_skill_gap(db, current_user.id, job_id)
        return success_response(data=analysis, message="Skill gap analysis complete")
    except ValueError as e:
        err_str = str(e)
        msg = err_str.split("|")[0] if "|" in err_str else err_str
        detail = err_str.split("|")[1] if "|" in err_str else err_str
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": msg,
                "data": None,
                "errors": [detail],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    except KeyError as e:
        # FastAPI might clean out KeyError quotes, so strip them if necessary
        err_str = str(e).strip("'\"")
        msg = err_str.split("|")[0] if "|" in err_str else err_str
        detail = err_str.split("|")[1] if "|" in err_str else err_str
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": msg,
                "data": None,
                "errors": [detail],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    except Exception as e:
        logging.error(f"Skill gap endpoint internal error:\n{e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An internal server error occurred.",
                "data": None,
                "errors": [str(e)],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )


from pydantic import BaseModel

class RoadmapRequestSchema(BaseModel):
    missing_skills: List[str]
    target_role: str

@router.post("/learning-roadmap", response_model=APIResponse)
def get_learning_roadmap(
    payload: RoadmapRequestSchema,
    current_user: User = Depends(get_current_user),
):
    roadmap = MatchingService.generate_learning_roadmap(payload.missing_skills, payload.target_role)
    return success_response(
        data=roadmap, message="Learning roadmap generated successfully"
    )
