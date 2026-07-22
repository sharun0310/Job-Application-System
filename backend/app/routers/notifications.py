from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.authentication.dependencies import get_current_user
from app.models.user import User
from app.services.notification_service import NotificationService
from app.utils.response import success_response

router = APIRouter()


@router.get("/", response_model=dict)
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = NotificationService.get_user_notifications(
        db, current_user.id, unread_only
    )
    return success_response(
        data=notifications, message="Notifications fetched successfully"
    )


@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = NotificationService.mark_as_read(
        db, notification_id, current_user.id
    )
    return success_response(data=notification, message="Notification marked as read")
