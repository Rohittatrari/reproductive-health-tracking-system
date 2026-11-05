from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app import models, schemas
from app.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/metrics")
def get_system_metrics(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    total_cycles = db.query(models.MenstrualCycle).count()
    total_symptom_logs = db.query(models.SymptomLog).count()
    total_reminders = db.query(models.HealthReminder).count()
    total_reports = db.query(models.HealthReport).count()
    total_articles = db.query(models.EducationalContent).count()
    total_chats = db.query(models.ChatbotConversation).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_cycles_logged": total_cycles,
        "total_symptom_logs": total_symptom_logs,
        "total_reminders_set": total_reminders,
        "total_reports_generated": total_reports,
        "total_educational_articles": total_articles,
        "total_ai_chat_queries": total_chats
    }

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    """Admin view of users without passwords or private health logs"""
    return db.query(models.User).order_by(desc(models.User.created_at)).all()

@router.patch("/users/{user_id}/toggle-status")
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"message": f"User status set to {'active' if user.is_active else 'inactive'}", "is_active": user.is_active}

@router.post("/education", response_model=schemas.EducationalContentOut, status_code=status.HTTP_201_CREATED)
def create_educational_article(
    article_in: schemas.EducationalContentCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    existing = db.query(models.EducationalContent).filter(models.EducationalContent.slug == article_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="An article with this slug already exists.")

    article = models.EducationalContent(
        title=article_in.title,
        slug=article_in.slug,
        category=article_in.category,
        excerpt=article_in.excerpt,
        content_markdown=article_in.content_markdown,
        read_time_minutes=article_in.read_time_minutes,
        is_featured=article_in.is_featured,
        tags=article_in.tags
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article

@router.put("/education/{article_id}", response_model=schemas.EducationalContentOut)
def update_educational_article(
    article_id: int,
    article_in: schemas.EducationalContentCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    article = db.query(models.EducationalContent).filter(models.EducationalContent.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")

    for field, val in article_in.model_dump().items():
        setattr(article, field, val)

    db.commit()
    db.refresh(article)
    return article

@router.delete("/education/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_educational_article(
    article_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin)
):
    article = db.query(models.EducationalContent).filter(models.EducationalContent.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found.")
    db.delete(article)
    db.commit()
    return None
