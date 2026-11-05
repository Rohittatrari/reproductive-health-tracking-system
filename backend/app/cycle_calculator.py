from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from app import models

CLINICAL_DISCLAIMER = (
    "Educational & Awareness Notice: Cycle and fertility predictions are calculated estimates based on past data "
    "and standard physiological averages. Because cycle length, ovulation timing, and hormone fluctuations can vary "
    "due to stress, sleep, illness, travel, or medical conditions, these predictions should not be used as a reliable "
    "method of contraception or pregnancy prevention, nor do they replace clinical medical advice."
)

def calculate_cycle_metrics(user_cycles: List[models.MenstrualCycle], user_profile: Optional[models.UserProfile] = None) -> Dict[str, Any]:
    """
    Computes average cycle length, average period length, standard deviation, and regularity.
    """
    default_cycle_length = user_profile.average_cycle_length if user_profile else 28
    default_period_length = user_profile.average_period_length if user_profile else 5

    completed_cycles = [c for c in user_cycles if c.cycle_length_days and c.cycle_length_days > 15 and c.cycle_length_days < 60]
    
    if completed_cycles:
        avg_cycle = round(sum(c.cycle_length_days for c in completed_cycles) / len(completed_cycles))
    else:
        avg_cycle = default_cycle_length

    period_durations = [c.period_duration_days for c in user_cycles if c.period_duration_days and c.period_duration_days > 1 and c.period_duration_days < 15]
    if period_durations:
        avg_period = round(sum(period_durations) / len(period_durations))
    else:
        avg_period = default_period_length

    # Regularity analysis
    is_regular = True
    variance = 0
    if len(completed_cycles) >= 2:
        lengths = [c.cycle_length_days for c in completed_cycles]
        variance = max(lengths) - min(lengths)
        if variance > 7:
            is_regular = False

    return {
        "average_cycle_length": avg_cycle,
        "average_period_length": avg_period,
        "completed_cycle_count": len(completed_cycles),
        "is_regular": is_regular,
        "cycle_variance_days": variance
    }

def estimate_cycle_dates(start_date: date, cycle_length: int, period_length: int = 5) -> Dict[str, Any]:
    """
    Given a period start date and cycle length:
    - Next period start = start_date + cycle_length
    - Ovulation date = next_period_start - 14 days
    - Fertile window = ovulation - 5 days to ovulation + 1 day
    """
    next_period_start = start_date + timedelta(days=cycle_length)
    ovulation_date = next_period_start - timedelta(days=14)
    fertile_start = ovulation_date - timedelta(days=5)
    fertile_end = ovulation_date + timedelta(days=1)

    return {
        "start_date": start_date,
        "period_end_date": start_date + timedelta(days=period_length - 1),
        "estimated_next_period": next_period_start,
        "estimated_ovulation_date": ovulation_date,
        "fertile_window_start": fertile_start,
        "fertile_window_end": fertile_end,
    }

def determine_current_phase(today: date, last_period_start: date, cycle_length: int, period_length: int) -> Dict[str, Any]:
    """
    Determines the current menstrual phase: Menstrual, Follicular, Ovulation/Fertile, Luteal.
    """
    day_diff = (today - last_period_start).days
    current_cycle_day = day_diff + 1 if day_diff >= 0 else 1

    dates = estimate_cycle_dates(last_period_start, cycle_length, period_length)
    fertile_start = dates["fertile_window_start"]
    fertile_end = dates["fertile_window_end"]
    ovulation_date = dates["estimated_ovulation_date"]
    next_period = dates["estimated_next_period"]

    is_fertile = (fertile_start <= today <= fertile_end)

    if today <= dates["period_end_date"]:
        phase_name = "Menstrual Phase"
        description = "Your uterine lining is shedding. Energy levels may be lower; focus on rest, hydration, and iron-rich foods."
        conception_chance = "Very Low"
    elif today < fertile_start:
        phase_name = "Follicular Phase"
        description = "Estrogen levels are gradually rising as follicles mature. You may feel an increase in physical energy and focus."
        conception_chance = "Low"
    elif is_fertile:
        if today == ovulation_date:
            phase_name = "Ovulation Day"
            description = "An egg has been released from the ovary. Estrogen and LH peak. This is your highest fertility window."
            conception_chance = "Peak"
        else:
            phase_name = "Fertile Window"
            description = "You are in your fertile window. Sperm can survive up to 5 days waiting for the ovum."
            conception_chance = "High"
    elif today < next_period:
        phase_name = "Luteal Phase"
        description = "Progesterone dominates to prepare the uterine lining. You may experience premenstrual symptoms (PMS) like mild cramps or cravings."
        conception_chance = "Low"
    else:
        # Overdue
        days_late = (today - next_period).days
        phase_name = "Late / Expecting Period"
        description = f"Your expected period was {days_late} day(s) ago. Factors like stress, travel, or hormone shifts can cause natural variations."
        conception_chance = "Low"

    days_until_next = (next_period - today).days

    return {
        "current_cycle_day": current_cycle_day,
        "phase_name": phase_name,
        "phase_description": description,
        "is_in_fertile_window": is_fertile,
        "chance_of_conception": conception_chance,
        "estimated_ovulation_date": ovulation_date,
        "fertile_window_start": fertile_start,
        "fertile_window_end": fertile_end,
        "estimated_next_period": next_period,
        "days_until_next_period": days_until_next,
        "disclaimer": CLINICAL_DISCLAIMER
    }
