from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.job import JobOut


class ApplicationCreate(BaseModel):
    job_id: int


class ApplicationStatusUpdate(BaseModel):
    status: str


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    created_at: datetime
    job: Optional[JobOut] = None

    model_config = {"from_attributes": True}
