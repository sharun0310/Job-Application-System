from pydantic import BaseModel
from datetime import datetime


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

    model_config = {"from_attributes": True}
