from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.cycle_calculator import calculate_cycle_metrics, estimate_cycle_dates

router = APIRouter(prefix="/reminders", tags=["Health Reminders"])

@router.get("", response_model=List[schemas.HealthReminderOut])
def get_user_reminders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.HealthReminder)\
        .filter(models.HealthReminder.user_id == current_user.id)\
        .order_by(models.HealthReminder.is_completed, models.HealthReminder.reminder_date)\
        .all()

@router.post("", response_model=schemas.HealthReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: schemas.HealthReminderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = models.HealthReminder(
        user_id=current_user.id,
        reminder_type=reminder_in.reminder_type,
        title=reminder_in.title,
        message=reminder_in.message,
        reminder_date=reminder_in.reminder_date,
        reminder_time=reminder_in.reminder_time,
        is_recurring=reminder_in.is_recurring,
        recurrence_interval=reminder_in.recurrence_interval,
        is_completed=False,
        is_active=True
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

@router.put("/{reminder_id}", response_model=schemas.HealthReminderOut)
def update_reminder(
    reminder_id: int,
    reminder_in: schemas.HealthReminderUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(models.HealthReminder).filter(
        models.HealthReminder.id == reminder_id,
        models.HealthReminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    for field, val in reminder_in.model_dump(exclude_unset=True).items():
        setattr(reminder, field, val)

    db.commit()
    db.refresh(reminder)
    return reminder

@router.patch("/{reminder_id}/toggle", response_model=schemas.HealthReminderOut)
def toggle_reminder_status(
    reminder_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(models.HealthReminder).filter(
        models.HealthReminder.id == reminder_id,
        models.HealthReminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    reminder.is_completed = not reminder.is_completed
    db.commit()
    db.refresh(reminder)
    return reminder

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = db.query(models.HealthReminder).filter(
        models.HealthReminder.id == reminder_id,
        models.HealthReminder.user_id == current_user.id
    ).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    db.delete(reminder)
    db.commit()
    return None

@router.post("/auto-sync", response_model=List[schemas.HealthReminderOut])
def auto_sync_cycle_reminders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligently generates upcoming period & ovulation reminders based on cycle projections.
    Avoids duplicate entries for the same target dates.
    """
    cycles = db.query(models.MenstrualCycle)\
        .filter(models.MenstrualCycle.user_id == current_user.id)\
        .order_by(desc(models.MenstrualCycle.start_date))\
        .all()
    if not cycles:
        return []

    profile = current_user.profile
    metrics = calculate_cycle_metrics(cycles, profile)
    avg_cycle = metrics["average_cycle_length"]
    avg_period = metrics["average_period_length"]
    lead_period_days = profile.reminder_period_days_before if profile else 2
    lead_fertility_days = profile.reminder_fertility_days_before if profile else 1

    latest_start = cycles[0].start_date
    estimates = estimate_cycle_dates(latest_start, avg_cycle, avg_period)
    next_period = estimates["estimated_next_period"]
    next_ovulation = estimates["estimated_ovulation_date"]

    created_reminders = []

    # Period reminder date
    period_rem_date = next_period - timedelta(days=lead_period_days)
    if period_rem_date >= date.today():
        existing_p = db.query(models.HealthReminder).filter(
            models.HealthReminder.user_id == current_user.id,
            models.HealthReminder.reminder_type == "period_expected",
            models.HealthReminder.reminder_date == period_rem_date
        ).first()
        if not existing_p:
            p_rem = models.HealthReminder(
                user_id=current_user.id,
                reminder_type="period_expected",
                title="Upcoming Period Expected",
                message=f"Your period is estimated to begin in {lead_period_days} days (around {next_period}). Prepare supplies & stay hydrated.",
                reminder_date=period_rem_date,
                reminder_time="08:30"
            )
            db.add(p_rem)
            created_reminders.append(p_rem)

    # Ovulation / Fertile window reminder date
    ov_rem_date = next_ovulation - timedelta(days=lead_fertility_days)
    if ov_rem_date >= date.today():
        existing_o = db.query(models.HealthReminder).filter(
            models.HealthReminder.user_id == current_user.id,
            models.HealthReminder.reminder_type == "ovulation_window",
            models.HealthReminder.reminder_date == ov_rem_date
        ).first()
        if not existing_o:
            o_rem = models.HealthReminder(
                user_id=current_user.id,
                reminder_type="ovulation_window",
                title="Estimated Ovulation Window Approaching",
                message=f"Estimated ovulation is expected around {next_ovulation}. Check fertility signs & log symptoms.",
                reminder_date=ov_rem_date,
                reminder_time="09:00"
            )
            db.add(o_rem)
            created_reminders.append(o_rem)

    db.commit()
    for r in created_reminders:
        db.refresh(r)
    return created_reminders
