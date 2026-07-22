from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService
from app.authentication.security import create_access_token
from app.utils.response import success_response, APIResponse

router = APIRouter()


@router.post("/register", response_model=APIResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, user_in)
    return success_response(
        data={"id": user.id, "email": user.email},
        message="User registered successfully",
    )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = AuthService.authenticate_user(
        db,
        form_data.username,
        form_data.password,
    )

    access_token = create_access_token(subject=user.email)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/logout")
def logout():
    # In a stateless JWT system, logout is typically handled client-side by dropping the token.
    # To implement server-side logout, a token blacklist could be used.
    return success_response(message="Successfully logged out")
