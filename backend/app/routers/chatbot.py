from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.ai.chatbot_service import chatbot_service
from app.utils.response import success_response

router = APIRouter()

class ChatMessageSchema(BaseModel):
    sender: str
    text: str

class ChatRequestSchema(BaseModel):
    message: str
    history: Optional[List[ChatMessageSchema]] = []
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat_with_advisor(payload: ChatRequestSchema):
    """
    Interactive endpoint for Career AI Advisor.
    Supports multi-turn conversation history and user profile context.
    """
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history_dicts = [h.model_dump() for h in payload.history] if payload.history else []
    
    reply = chatbot_service.generate_chat_response(
        message=payload.message.strip(),
        history=history_dicts,
        user_context=payload.context
    )

    return success_response(
        data={"reply": reply},
        message="Response generated successfully"
    )
