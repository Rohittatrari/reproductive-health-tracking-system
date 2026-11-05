from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.ai_assistant import generate_assistant_response

router = APIRouter(prefix="/assistant", tags=["AI Educational Health Assistant"])

@router.post("/chat", response_model=schemas.ChatMessageOut)
def chat_with_assistant(
    chat_in: schemas.ChatMessageIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save user message
    user_msg = models.ChatbotConversation(
        user_id=current_user.id,
        role="user",
        message=chat_in.message,
        disclaimer_included=False
    )
    db.add(user_msg)
    db.commit()

    # Generate response
    resp = generate_assistant_response(chat_in.message)

    bot_msg = models.ChatbotConversation(
        user_id=current_user.id,
        role="assistant",
        message=resp["message"],
        disclaimer_included=resp["disclaimer_included"]
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return bot_msg

@router.get("/history", response_model=List[schemas.ChatMessageOut])
def get_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.ChatbotConversation)\
        .filter(models.ChatbotConversation.user_id == current_user.id)\
        .order_by(models.ChatbotConversation.timestamp)\
        .all()

@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.ChatbotConversation)\
        .filter(models.ChatbotConversation.user_id == current_user.id)\
        .delete()
    db.commit()
    return None
