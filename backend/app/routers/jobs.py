from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.job import JobCreate, JobOut
from app.services.job_service import JobService
from app.authentication.dependencies import get_current_admin
from app.models.user import User
from app.utils.response import success_response

router = APIRouter()


from app.utils.response import APIResponse

@router.get("", response_model=APIResponse)
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = JobService.get_jobs(db, skip=skip, limit=limit)

    return success_response(
        data=[JobOut.model_validate(job).model_dump() for job in jobs]
    )

@router.get("/{job_id}", response_model=APIResponse)
def read_job(job_id: int, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)
    return success_response(data=JobOut.model_validate(job).model_dump())


@router.post("", response_model=APIResponse)
def create_job(
    job_in: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    job = JobService.create_job(db, job_in)
    return success_response(
        data=JobOut.model_validate(job).model_dump(), message="Job created successfully"
    )


@router.get("/{job_id}", response_model=APIResponse)
def read_job(job_id: int, db: Session = Depends(get_db)):
    job = JobService.get_job(db, job_id)

    return success_response(
        data=JobOut.model_validate(job).model_dump(),
        message="Request successful"
    )