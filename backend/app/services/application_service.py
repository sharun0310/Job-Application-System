from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.application import Application
from app.models.job import Job


class ApplicationService:
    @staticmethod
    def apply_for_job(db: Session, user_id: int, job_id: int):
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        existing_app = (
            db.query(Application)
            .filter(Application.user_id == user_id, Application.job_id == job_id)
            .first()
        )

        if existing_app:
            raise HTTPException(status_code=400, detail="Already applied to this job")

        application = Application(user_id=user_id, job_id=job_id, status="Applied")
        db.add(application)
        db.commit()
        db.refresh(application)
        return application

    @staticmethod
    def get_user_applications(db: Session, user_id: int):
        return db.query(Application).filter(Application.user_id == user_id).all()
