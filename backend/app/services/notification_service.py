from sqlalchemy.orm import Session
from app.models.others import Notification
from app.schemas.notification import NotificationCreate
from fastapi import HTTPException
from typing import List


class NotificationService:
    @staticmethod
    def get_user_notifications(
        db: Session, user_id: int, unread_only: bool = False
    ) -> List[Notification]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.read_status == False)
        return query.order_by(Notification.created_at.desc()).all()

    @staticmethod
    def create_notification(
        db: Session, notification_in: NotificationCreate
    ) -> Notification:
        notification = Notification(**notification_in.model_dump())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Notification:
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")

        notification.read_status = True
        db.commit()
        db.refresh(notification)
        return notification
