from datetime import date, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models
from app.auth import get_current_user
from app.cycle_calculator import calculate_cycle_metrics, estimate_cycle_dates, determine_current_phase, CLINICAL_DISCLAIMER

router = APIRouter(prefix="/fertility", tags=["Fertility Awareness"])

@router.get("/estimate")
def get_fertility_estimate(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes current fertility window status, next estimated ovulation,
    and conception likelihood with mandatory educational warnings.
    """
    cycles = db.query(models.MenstrualCycle)\
        .filter(models.MenstrualCycle.user_id == current_user.id)\
        .order_by(desc(models.MenstrualCycle.start_date))\
        .all()

    today = date.today()
    metrics = calculate_cycle_metrics(cycles, current_user.profile)
    avg_cycle = metrics["average_cycle_length"]
    avg_period = metrics["average_period_length"]

    if cycles:
        latest_start = cycles[0].start_date
        phase_info = determine_current_phase(today, latest_start, avg_cycle, avg_period)
        
        # Calculate 3 upcoming future fertile windows
        upcoming_windows = []
        cursor = latest_start
        for i in range(3):
            est = estimate_cycle_dates(cursor, avg_cycle, avg_period)
            upcoming_windows.append({
                "cycle_projection": i + 1,
                "fertile_window_start": est["fertile_window_start"].isoformat(),
                "fertile_window_end": est["fertile_window_end"].isoformat(),
                "estimated_ovulation_date": est["estimated_ovulation_date"].isoformat(),
                "estimated_period_start": est["estimated_next_period"].isoformat()
            })
            cursor = est["estimated_next_period"]

        return {
            "has_data": True,
            "current_status": phase_info,
            "average_cycle_length": avg_cycle,
            "upcoming_windows": upcoming_windows,
            "clinical_disclaimer": CLINICAL_DISCLAIMER
        }
    else:
        # Default baseline if user hasn't logged periods yet
        est = estimate_cycle_dates(today, avg_cycle, avg_period)
        return {
            "has_data": False,
            "current_status": {
                "phase_name": "No Cycles Recorded Yet",
                "phase_description": "Log your most recent period start date to unlock personalized fertility estimates.",
                "is_in_fertile_window": False,
                "chance_of_conception": "Unknown",
                "estimated_ovulation_date": est["estimated_ovulation_date"],
                "fertile_window_start": est["fertile_window_start"],
                "fertile_window_end": est["fertile_window_end"],
            },
            "average_cycle_length": avg_cycle,
            "upcoming_windows": [],
            "clinical_disclaimer": CLINICAL_DISCLAIMER
        }

@router.get("/educational-guide")
def get_fertility_educational_guide():
    """
    Clinical educational principles on fertility awareness, biological signs,
    and contraception safety.
    """
    return {
        "title": "Comprehensive Guide to Fertility Awareness & Natural Family Planning",
        "key_principles": [
            {
                "topic": "Sperm & Ovum Longevity",
                "details": "Healthy sperm can survive in cervical fluid for up to 5 days, while the human ovum remains viable for only 12 to 24 hours after release. The fertile window spans approximately 6 days."
            },
            {
                "topic": "Basal Body Temperature (BBT)",
                "details": "Progesterone released by the corpus luteum causes a subtle rise in resting body temperature (0.5°F to 1.0°F) within 24 hours after ovulation. BBT confirms ovulation occurred, rather than predicting it in advance."
            },
            {
                "topic": "Cervical Mucus Changes",
                "details": "As estrogen peaks before ovulation, cervical fluid becomes clear, slippery, and stretchy (resembling raw egg whites). This fertile mucus nourishes sperm and facilitates transport."
            },
            {
                "topic": "Luteinizing Hormone (LH) Surge",
                "details": "An LH surge detected via urine test strips occurs 24 to 36 hours prior to the release of the egg, providing the most reliable biochemical timing indicator."
            }
        ],
        "important_contraceptive_warning": (
            "Natural rhythm and calendar calculations alone have a typical-use failure rate of up to 24% "
            "as a contraceptive method. Stress, illness, travel, and sleep changes can cause early or delayed ovulation. "
            "Use reliable barrier methods or consult a gynecologist for medically verified contraception."
        )
    }
