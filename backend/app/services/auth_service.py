from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.authentication.security import get_password_hash, verify_password


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        try:
            user = db.query(User).filter(User.email == user_in.email).first()

            if user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The user with this email already exists in the system.",
                )

            hashed_password = get_password_hash(user_in.password)

            db_user = User(
                email=user_in.email,
                hashed_password=hashed_password,
                role=user_in.role or "student",
                )

            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            return db_user

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        return user