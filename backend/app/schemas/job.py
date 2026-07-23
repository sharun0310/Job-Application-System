from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobBase(BaseModel):
    title: str
    company_id: int
    company_name: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    description: str
    required_skills: Optional[str] = None
    application_link: Optional[str] = None
    deadline: Optional[datetime] = None


class JobCreate(JobBase):
    pass


class JobOut(JobBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
