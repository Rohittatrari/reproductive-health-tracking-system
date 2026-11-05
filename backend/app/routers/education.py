from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/education", tags=["Educational Health Section"])

CATEGORIES = [
    {"key": "menstrual_health", "name": "Menstrual Health & Cycle Basics", "description": "Learn about the 4 phases, normal cycle variations, and cycle biology."},
    {"key": "reproductive_health", "name": "Reproductive Anatomy & Physiology", "description": "Clear insights into reproductive organs, hormones, and bodily changes."},
    {"key": "hormonal_changes", "name": "Hormones & PMS/PMDD", "description": "Understanding estrogen, progesterone, and coping with premenstrual syndrome."},
    {"key": "pcos_endometriosis", "name": "PCOS & Endometriosis Awareness", "description": "Signs, causes, and clinical management of common endocrine conditions."},
    {"key": "pregnancy_fertility", "name": "Fertility, Ovulation & Conception", "description": "The biological fertile window, conception likelihood, and planning."},
    {"key": "hygiene_preventive", "name": "Hygiene & Preventive Healthcare", "description": "Menstrual product safety, TSS precautions, and doctor visit checklists."}
]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    result = []
    for cat in CATEGORIES:
        count = db.query(models.EducationalContent).filter(models.EducationalContent.category == cat["key"]).count()
        result.append({**cat, "article_count": count})
    return result

@router.get("/articles", response_model=List[schemas.EducationalContentOut])
def get_articles(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.EducationalContent)
    if category:
        query = query.filter(models.EducationalContent.category == category)
    if featured is not None:
        query = query.filter(models.EducationalContent.is_featured == featured)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            models.EducationalContent.title.ilike(search_filter) |
            models.EducationalContent.excerpt.ilike(search_filter) |
            models.EducationalContent.content_markdown.ilike(search_filter)
        )
    return query.order_by(desc(models.EducationalContent.is_featured), desc(models.EducationalContent.created_at)).all()

@router.get("/articles/{slug}", response_model=schemas.EducationalContentOut)
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    article = db.query(models.EducationalContent).filter(models.EducationalContent.slug == slug).first()
    if not article:
        raise HTTPException(status_code=404, detail="Educational article not found.")
    return article

@router.get("/recommendations", response_model=List[schemas.EducationalContentOut])
def get_personalized_recommendations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligently recommends educational articles based on user profile
    and logged symptoms (e.g. cramps -> menstrual health; PCOS -> pcos_endometriosis).
    """
    recommended_categories = set()
    
    # Check profile
    profile = current_user.profile
    if profile:
        if profile.tracking_goal in ("conceive", "prevent_pregnancy"):
            recommended_categories.add("pregnancy_fertility")
        if profile.medical_conditions:
            cond_str = profile.medical_conditions.lower()
            if "pcos" in cond_str or "endometriosis" in cond_str:
                recommended_categories.add("pcos_endometriosis")

    # Check recent logged symptoms
    recent_symptoms = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id
    ).order_by(desc(models.SymptomLog.date)).limit(10).all()

    for log in recent_symptoms:
        s_name = (log.symptom.name if log.symptom else "").lower()
        if "cramp" in s_name or "pain" in s_name:
            recommended_categories.add("menstrual_health")
        elif "mood" in s_name or "bloat" in s_name:
            recommended_categories.add("hormonal_changes")
        elif "acne" in s_name:
            recommended_categories.add("pcos_endometriosis")

    if not recommended_categories:
        recommended_categories = {"menstrual_health", "hygiene_preventive", "pregnancy_fertility"}

    articles = db.query(models.EducationalContent).filter(
        models.EducationalContent.category.in_(list(recommended_categories))
    ).limit(6).all()

    return articles
