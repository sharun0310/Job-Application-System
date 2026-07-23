from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    whatsapp_number: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"


class UserOut(UserBase):
    id: int
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
