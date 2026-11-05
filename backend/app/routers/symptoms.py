from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/symptoms", tags=["Symptom Tracking & Analytics"])

@router.get("", response_model=List[schemas.SymptomOut])
def get_all_symptoms(db: Session = Depends(get_db)):
    """Retrieve catalog of symptoms grouped by category"""
    return db.query(models.Symptom).order_by(models.Symptom.category, models.Symptom.name).all()

@router.post("/custom", response_model=schemas.SymptomOut, status_code=status.HTTP_201_CREATED)
def create_custom_symptom(
    name: str = Query(..., min_length=2),
    category: str = Query("physical"),
    icon: str = Query("Activity"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    clean_name = name.strip()
    existing = db.query(models.Symptom).filter(models.Symptom.name.ilike(clean_name)).first()
    if existing:
        return existing
    
    new_symptom = models.Symptom(
        name=clean_name,
        category=category.lower(),
        icon=icon,
        description=f"User-recorded symptom: {clean_name}"
    )
    db.add(new_symptom)
    db.commit()
    db.refresh(new_symptom)
    return new_symptom

@router.post("/log", response_model=schemas.SymptomLogOut, status_code=status.HTTP_201_CREATED)
def log_symptom(
    log_in: schemas.SymptomLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symptom = db.query(models.Symptom).filter(models.Symptom.id == log_in.symptom_id).first()
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found in catalog.")

    # Check if this symptom is already logged for this user on this day
    existing = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.symptom_id == log_in.symptom_id,
        models.SymptomLog.date == log_in.date
    ).first()

    if existing:
        existing.severity = log_in.severity
        existing.notes = log_in.notes
        db.commit()
        db.refresh(existing)
        return existing

    new_log = models.SymptomLog(
        user_id=current_user.id,
        symptom_id=log_in.symptom_id,
        date=log_in.date,
        severity=log_in.severity,
        notes=log_in.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/logs", response_model=List[schemas.SymptomLogOut])
def get_user_symptom_logs(
    start: Optional[date] = None,
    end: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.SymptomLog).filter(models.SymptomLog.user_id == current_user.id)
    if start:
        query = query.filter(models.SymptomLog.date >= start)
    if end:
        query = query.filter(models.SymptomLog.date <= end)
    return query.order_by(desc(models.SymptomLog.date)).all()

@router.delete("/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_symptom_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(models.SymptomLog).filter(
        models.SymptomLog.id == log_id,
        models.SymptomLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Symptom log entry not found.")
    db.delete(log)
    db.commit()
    return None

@router.get("/analytics")
def get_symptom_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated metrics for data visualization:
    - Top symptoms by frequency
    - Severity breakdown (mild, moderate, severe)
    - Category distribution (physical, emotional, digestive, etc.)
    - Daily timeline trends for charting
    """
    cutoff_date = date.today() - timedelta(days=days)

    logs = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date >= cutoff_date
    ).all()

    # Symptom counts & severity
    summary_map = {}
    category_counts = {}
    timeline_map = {}

    for log in logs:
        s_name = log.symptom.name if log.symptom else "Other"
        cat = log.symptom.category if log.symptom else "physical"

        if s_name not in summary_map:
            summary_map[s_name] = {
                "symptom_name": s_name,
                "category": cat,
                "count": 0,
                "mild": 0,
                "moderate": 0,
                "severe": 0
            }
        summary_map[s_name]["count"] += 1
        if log.severity == "mild":
            summary_map[s_name]["mild"] += 1
        elif log.severity == "moderate":
            summary_map[s_name]["moderate"] += 1
        elif log.severity == "severe":
            summary_map[s_name]["severe"] += 1

        category_counts[cat] = category_counts.get(cat, 0) + 1

        d_str = log.date.isoformat()
        timeline_map.setdefault(d_str, {"date": d_str, "total_symptoms": 0})
        timeline_map[d_str]["total_symptoms"] += 1
        timeline_map[d_str][s_name] = timeline_map[d_str].get(s_name, 0) + 1

    top_symptoms = sorted(summary_map.values(), key=lambda x: x["count"], reverse=True)
    category_distribution = [{"category": k.capitalize(), "count": v} for k, v in category_counts.items()]
    timeline_trends = sorted(timeline_map.values(), key=lambda x: x["date"])

    return {
        "timeframe_days": days,
        "total_logs": len(logs),
        "top_symptoms": top_symptoms,
        "category_distribution": category_distribution,
        "timeline_trends": timeline_trends
    }
