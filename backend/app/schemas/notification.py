from pydantic import BaseModel
from datetime import datetime


class NotificationBase(BaseModel):
    title: str
    message: str
    read_status: bool = False


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationOut(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
