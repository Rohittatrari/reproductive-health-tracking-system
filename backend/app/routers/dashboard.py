from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.cycle_calculator import calculate_cycle_metrics, determine_current_phase, estimate_cycle_dates

router = APIRouter(prefix="/dashboard", tags=["Dashboard Summary"])

@router.get("/summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    # Fetch cycles
    cycles = db.query(models.MenstrualCycle)\
        .filter(models.MenstrualCycle.user_id == current_user.id)\
        .order_by(desc(models.MenstrualCycle.start_date))\
        .all()

    profile = current_user.profile
    metrics = calculate_cycle_metrics(cycles, profile)
    avg_cycle = metrics["average_cycle_length"]
    avg_period = metrics["average_period_length"]

    # Recent period records
    period_records = db.query(models.PeriodRecord)\
        .filter(models.PeriodRecord.user_id == current_user.id)\
        .order_by(desc(models.PeriodRecord.date))\
        .limit(7)\
        .all()

    # Recent symptoms
    recent_symptoms = db.query(models.SymptomLog)\
        .filter(models.SymptomLog.user_id == current_user.id)\
        .order_by(desc(models.SymptomLog.date))\
        .limit(8)\
        .all()

    # Upcoming reminders
    upcoming_reminders = db.query(models.HealthReminder)\
        .filter(
            models.HealthReminder.user_id == current_user.id,
            models.HealthReminder.reminder_date >= today,
            models.HealthReminder.is_completed == False,
            models.HealthReminder.is_active == True
        )\
        .order_by(models.HealthReminder.reminder_date)\
        .limit(5)\
        .all()

    insights = []

    if cycles:
        latest_cycle = cycles[0]
        last_period_date = latest_cycle.start_date
        phase_info = determine_current_phase(today, last_period_date, avg_cycle, avg_period)
        
        cycle_day = phase_info["current_cycle_day"]
        phase_name = phase_info["phase_name"]
        phase_desc = phase_info["phase_description"]
        est_next_period = phase_info["estimated_next_period"]
        est_ovulation = phase_info["estimated_ovulation_date"]
        fertile_start = phase_info["fertile_window_start"]
        fertile_end = phase_info["fertile_window_end"]
        is_fertile = phase_info["is_in_fertile_window"]
        conception_chance = phase_info["chance_of_conception"]

        days_until_period = (est_next_period - today).days
        if days_until_period > 0:
            insights.append(f"Your next period is estimated to start in {days_until_period} day{'s' if days_until_period > 1 else ''}.")
        elif days_until_period == 0:
            insights.append("Your period is expected today.")
        else:
            insights.append(f"Your period is {abs(days_until_period)} day{'s' if abs(days_until_period) > 1 else ''} past the expected date.")

        if is_fertile:
            insights.append("🌸 You are currently in your estimated fertile window.")
    else:
        # User has no cycles logged yet
        cycle_day = None
        phase_name = "Welcome! Ready to Track"
        phase_desc = "Log the first day of your last period to receive personalized cycle days, fertility windows, and phase insights."
        last_period_date = None
        est_next_period = None
        est_ovulation = None
        fertile_start = None
        fertile_end = None
        is_fertile = False
        conception_chance = "Log cycle to calculate"
        insights.append("Start by recording your last period to get accurate cycle tracking.")

    if not metrics["is_regular"] and len(cycles) >= 2:
        insights.append("Your cycle shows variability of over 7 days. Tracking symptoms and sleep can help identify patterns.")

    return {
        "current_cycle_day": cycle_day,
        "phase_name": phase_name,
        "phase_description": phase_desc,
        "last_period_date": last_period_date,
        "estimated_next_period": est_next_period,
        "estimated_ovulation_date": est_ovulation,
        "fertile_window_start": fertile_start,
        "fertile_window_end": fertile_end,
        "is_in_fertile_window": is_fertile,
        "chance_of_conception": conception_chance,
        "average_cycle_length": avg_cycle,
        "average_period_length": avg_period,
        "cycle_history": cycles[:6],
        "recent_period_records": period_records,
        "recent_symptoms": recent_symptoms,
        "upcoming_reminders": upcoming_reminders,
        "insights": insights
    }
