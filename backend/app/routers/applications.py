from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.services.application_service import ApplicationService
from app.authentication.dependencies import get_current_user
from app.models.user import User
from app.utils.response import success_response, APIResponse

router = APIRouter()


@router.post("/apply", response_model=APIResponse)
def apply_job(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = ApplicationService.apply_for_job(db, current_user.id, app_in.job_id)
    return success_response(
        data=ApplicationOut.model_validate(application).model_dump(),
        message="Successfully applied to job",
    )


@router.get("", response_model=APIResponse)
def read_applications(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    applications = ApplicationService.get_user_applications(db, current_user.id)
    return success_response(
        data=[ApplicationOut.model_validate(app).model_dump() for app in applications]
    )
