from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.resume import Resume
from app.authentication.dependencies import get_current_user
from app.services.resume_service import ResumeService
from app.utils.response import success_response

router = APIRouter()

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/jpg",
]


@router.post("/upload")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    file_bytes = await file.read()

    # Check size (e.g. max 5MB)
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    # 1. Create a placeholder in the DB
    resume = Resume(
        user_id=current_user.id,
        file_path=f"uploads/{file.filename}",  # In reality, save to S3/GCS
        parsed_data={"status": "processing"},
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # 2. Dispatch to BackgroundTasks
    background_tasks.add_task(
        ResumeService.process_resume_background,
        db,
        current_user.id,
        resume.id,
        file_bytes,
        file.content_type,
    )

    return success_response(
        message="Resume uploaded successfully. Processing in background.",
        data={"resume_id": resume.id, "status": "processing"},
    )


@router.get("/{user_id}")
def get_resume(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Simple authorization check
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    resume = db.query(Resume).filter(Resume.user_id == user_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return success_response(
        data={"resume_id": resume.id, "parsed_data": resume.parsed_data}
    )
