from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService
from app.authentication.security import create_access_token
from app.authentication.dependencies import get_current_user
from app.models.user import User
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


@router.get("/me", response_model=APIResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile information."""
    return success_response(
        data={
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "whatsapp_number": current_user.whatsapp_number,
        },
        message="User profile fetched successfully",
    )
