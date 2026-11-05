from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.cycle_calculator import calculate_cycle_metrics, estimate_cycle_dates

router = APIRouter(prefix="/cycles", tags=["Menstrual Cycle Tracking"])

@router.get("", response_model=List[schemas.CycleOut])
def get_user_cycles(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.MenstrualCycle)\
        .filter(models.MenstrualCycle.user_id == current_user.id)\
        .order_by(desc(models.MenstrualCycle.start_date))\
        .all()

@router.post("", response_model=schemas.CycleOut, status_code=status.HTTP_201_CREATED)
def record_cycle_start(
    cycle_in: schemas.CycleCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch existing cycles
    existing_cycles = db.query(models.MenstrualCycle)\
        .filter(models.MenstrualCycle.user_id == current_user.id)\
        .order_by(desc(models.MenstrualCycle.start_date))\
        .all()

    # Check if a cycle already starts on this date
    for c in existing_cycles:
        if c.start_date == cycle_in.start_date:
            raise HTTPException(status_code=400, detail="A menstrual cycle is already recorded starting on this date.")

    # Calculate metrics based on history
    metrics = calculate_cycle_metrics(existing_cycles, current_user.profile)
    avg_cycle = metrics["average_cycle_length"]
    period_length = cycle_in.period_duration_days or metrics["average_period_length"]

    # If there is a previous open cycle, close it by computing end_date and cycle_length_days
    if existing_cycles:
        last_cycle = existing_cycles[0]
        if last_cycle.start_date < cycle_in.start_date:
            last_cycle.end_date = cycle_in.start_date - timedelta(days=1)
            last_cycle.cycle_length_days = (cycle_in.start_date - last_cycle.start_date).days
            db.add(last_cycle)

    # Estimate future dates for this cycle
    estimates = estimate_cycle_dates(cycle_in.start_date, avg_cycle, period_length)

    cycle_num = len(existing_cycles) + 1
    new_cycle = models.MenstrualCycle(
        user_id=current_user.id,
        cycle_number=cycle_num,
        start_date=cycle_in.start_date,
        end_date=cycle_in.end_date,
        period_duration_days=period_length,
        estimated_ovulation_date=estimates["estimated_ovulation_date"],
        fertile_window_start=estimates["fertile_window_start"],
        fertile_window_end=estimates["fertile_window_end"],
        notes=cycle_in.notes,
        is_predicted=False
    )
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)

    # Also log a period record for the first day if not already logged
    existing_period = db.query(models.PeriodRecord).filter(
        models.PeriodRecord.user_id == current_user.id,
        models.PeriodRecord.date == cycle_in.start_date
    ).first()
    if not existing_period:
        p_rec = models.PeriodRecord(
            user_id=current_user.id,
            cycle_id=new_cycle.id,
            date=cycle_in.start_date,
            flow_intensity="medium",
            pain_level=2
        )
        db.add(p_rec)
        db.commit()

    # Update profile average if more cycles are now available
    all_cycles = db.query(models.MenstrualCycle).filter(models.MenstrualCycle.user_id == current_user.id).all()
    updated_metrics = calculate_cycle_metrics(all_cycles, current_user.profile)
    if current_user.profile:
        current_user.profile.average_cycle_length = updated_metrics["average_cycle_length"]
        current_user.profile.average_period_length = updated_metrics["average_period_length"]
        db.add(current_user.profile)
        db.commit()

    return new_cycle

@router.delete("/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cycle(
    cycle_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cycle = db.query(models.MenstrualCycle).filter(
        models.MenstrualCycle.id == cycle_id,
        models.MenstrualCycle.user_id == current_user.id
    ).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle record not found.")
    db.delete(cycle)
    db.commit()
    return None

# --- Period Daily Records ---
@router.get("/periods/records", response_model=List[schemas.PeriodRecordOut])
def get_period_records(
    start: Optional[date] = None,
    end: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.PeriodRecord).filter(models.PeriodRecord.user_id == current_user.id)
    if start:
        query = query.filter(models.PeriodRecord.date >= start)
    if end:
        query = query.filter(models.PeriodRecord.date <= end)
    return query.order_by(desc(models.PeriodRecord.date)).all()

@router.post("/periods/records", response_model=schemas.PeriodRecordOut, status_code=status.HTTP_201_CREATED)
def record_period_day(
    period_in: schemas.PeriodRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if record for this date already exists; if so, update it
    existing = db.query(models.PeriodRecord).filter(
        models.PeriodRecord.user_id == current_user.id,
        models.PeriodRecord.date == period_in.date
    ).first()

    # Find matching cycle if any
    matching_cycle = db.query(models.MenstrualCycle).filter(
        models.MenstrualCycle.user_id == current_user.id,
        models.MenstrualCycle.start_date <= period_in.date
    ).order_by(desc(models.MenstrualCycle.start_date)).first()

    cycle_id = matching_cycle.id if matching_cycle else None

    if existing:
        existing.flow_intensity = period_in.flow_intensity
        existing.pain_level = period_in.pain_level
        existing.pad_tampon_count = period_in.pad_tampon_count
        existing.notes = period_in.notes
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_record = models.PeriodRecord(
            user_id=current_user.id,
            cycle_id=cycle_id,
            date=period_in.date,
            flow_intensity=period_in.flow_intensity,
            pain_level=period_in.pain_level,
            pad_tampon_count=period_in.pad_tampon_count,
            notes=period_in.notes
        )
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        return new_record

@router.delete("/periods/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_period_record(
    record_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = db.query(models.PeriodRecord).filter(
        models.PeriodRecord.id == record_id,
        models.PeriodRecord.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Period record not found.")
    db.delete(rec)
    db.commit()
    return None

# --- Monthly Calendar Mapping ---
@router.get("/calendar/month")
def get_month_calendar_data(
    year: int = Query(..., ge=2000, le=2100),
    month: int = Query(..., ge=1, le=12),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns day-by-day markers for the requested month:
    - Period logged
    - Predicted next period days
    - Fertile window
    - Ovulation day
    - Symptoms logged count
    """
    from calendar import monthrange
    days_in_month = monthrange(year, month)[1]
    start_of_month = date(year, month, 1)
    end_of_month = date(year, month, days_in_month)

    # Fetch periods
    period_records = db.query(models.PeriodRecord).filter(
        models.PeriodRecord.user_id == current_user.id,
        models.PeriodRecord.date >= start_of_month,
        models.PeriodRecord.date <= end_of_month
    ).all()
    period_map = {p.date: p for p in period_records}

    # Fetch cycles for predictions
    cycles = db.query(models.MenstrualCycle).filter(
        models.MenstrualCycle.user_id == current_user.id
    ).order_by(desc(models.MenstrualCycle.start_date)).all()

    metrics = calculate_cycle_metrics(cycles, current_user.profile)
    avg_cycle = metrics["average_cycle_length"]
    avg_period = metrics["average_period_length"]

    # Compute prediction ranges
    predicted_period_dates = set()
    fertile_dates = set()
    ovulation_dates = set()

    if cycles:
        latest_start = cycles[0].start_date
        # Project 3 cycles ahead
        current_cursor = latest_start
        for _ in range(4):
            est = estimate_cycle_dates(current_cursor, avg_cycle, avg_period)
            
            # Add estimated period range
            p_start = est["estimated_next_period"]
            for d in range(avg_period):
                predicted_period_dates.add(p_start + timedelta(days=d))

            # Add fertile window
            f_cur = est["fertile_window_start"]
            while f_cur <= est["fertile_window_end"]:
                fertile_dates.add(f_cur)
                f_cur += timedelta(days=1)

            # Ovulation
            ovulation_dates.add(est["estimated_ovulation_date"])

            current_cursor = est["estimated_next_period"]

    # Fetch symptom logs for this month
    symptom_logs = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date >= start_of_month,
        models.SymptomLog.date <= end_of_month
    ).all()
    symptoms_by_date = {}
    for s in symptom_logs:
        symptoms_by_date.setdefault(s.date, []).append({
            "id": s.id,
            "name": s.symptom.name if s.symptom else "Symptom",
            "severity": s.severity
        })

    # Build calendar day list
    days_data = []
    for day_num in range(1, days_in_month + 1):
        cur_date = date(year, month, day_num)
        p_record = period_map.get(cur_date)

        days_data.append({
            "date": cur_date.isoformat(),
            "day": day_num,
            "is_period": bool(p_record),
            "flow_intensity": p_record.flow_intensity if p_record else None,
            "pain_level": p_record.pain_level if p_record else None,
            "is_predicted_period": cur_date in predicted_period_dates and not bool(p_record),
            "is_fertile": cur_date in fertile_dates,
            "is_ovulation": cur_date in ovulation_dates,
            "symptoms": symptoms_by_date.get(cur_date, [])
        })

    return {
        "year": year,
        "month": month,
        "days": days_data,
        "average_cycle_length": avg_cycle,
        "average_period_length": avg_period
    }
