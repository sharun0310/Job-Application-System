from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.job import Job
from app.schemas.job import JobCreate


class JobService:
    @staticmethod
    def get_jobs(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Job).offset(skip).limit(limit).all()

    @staticmethod
    def get_job(db: Session, job_id: int):
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    def create_job(db: Session, job_in: JobCreate):
        job = Job(**job_in.model_dump())
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def delete_job(db: Session, job_id: int):
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        db.delete(job)
        db.commit()
        return job
