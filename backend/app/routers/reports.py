import os
import json
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.cycle_calculator import calculate_cycle_metrics
from app.pdf_generator import generate_health_report_pdf

router = APIRouter(prefix="/reports", tags=["Health Reports & PDF Export"])

@router.get("", response_model=List[schemas.HealthReportOut])
def get_user_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.HealthReport)\
        .filter(models.HealthReport.user_id == current_user.id)\
        .order_by(desc(models.HealthReport.generated_at))\
        .all()

@router.post("/generate", response_model=schemas.HealthReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    report_in: schemas.HealthReportCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch cycles in date range
    cycles = db.query(models.MenstrualCycle).filter(
        models.MenstrualCycle.user_id == current_user.id,
        models.MenstrualCycle.start_date >= report_in.start_date,
        models.MenstrualCycle.start_date <= report_in.end_date
    ).order_by(desc(models.MenstrualCycle.start_date)).all()

    # Calculate metrics
    metrics = calculate_cycle_metrics(cycles, current_user.profile)

    # Fetch symptoms in date range
    symptom_logs = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date >= report_in.start_date,
        models.SymptomLog.date <= report_in.end_date
    ).all()

    # Aggregate symptoms
    symptom_summary_map = {}
    for log in symptom_logs:
        s_name = log.symptom.name if log.symptom else "General"
        cat = log.symptom.category if log.symptom else "physical"
        if s_name not in symptom_summary_map:
            symptom_summary_map[s_name] = {
                "symptom_name": s_name,
                "category": cat,
                "count": 0,
                "mild_count": 0,
                "moderate_count": 0,
                "severe_count": 0
            }
        symptom_summary_map[s_name]["count"] += 1
        if log.severity == "mild":
            symptom_summary_map[s_name]["mild_count"] += 1
        elif log.severity == "moderate":
            symptom_summary_map[s_name]["moderate_count"] += 1
        elif log.severity == "severe":
            symptom_summary_map[s_name]["severe_count"] += 1

    symptom_summary = list(symptom_summary_map.values())

    # Format cycles for PDF
    cycles_data = [
        {
            "cycle_number": c.cycle_number,
            "start_date": str(c.start_date),
            "end_date": str(c.end_date) if c.end_date else None,
            "cycle_length_days": c.cycle_length_days,
            "period_duration_days": c.period_duration_days,
            "estimated_ovulation_date": str(c.estimated_ovulation_date) if c.estimated_ovulation_date else None
        }
        for c in cycles
    ]

    # Generate PDF
    pdf_path = generate_health_report_pdf(
        user_name=current_user.full_name,
        user_email=current_user.email,
        report_title=report_in.title,
        start_date=report_in.start_date,
        end_date=report_in.end_date,
        stats=metrics,
        cycle_records=cycles_data,
        symptom_summary=symptom_summary
    )

    summary_data = {
        "metrics": metrics,
        "total_cycles_logged": len(cycles),
        "total_symptom_occurrences": len(symptom_logs),
        "top_symptoms": symptom_summary[:5]
    }

    report = models.HealthReport(
        user_id=current_user.id,
        title=report_in.title,
        report_type=report_in.report_type,
        start_date=report_in.start_date,
        end_date=report_in.end_date,
        summary_json=json.dumps(summary_data),
        pdf_file_path=pdf_path
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(models.HealthReport).filter(
        models.HealthReport.id == report_id,
        models.HealthReport.user_id == current_user.id
    ).first()
    if not report or not report.pdf_file_path or not os.path.exists(report.pdf_file_path):
        raise HTTPException(status_code=404, detail="PDF report file not found on server.")

    return FileResponse(
        report.pdf_file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.pdf_file_path)
    )

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(models.HealthReport).filter(
        models.HealthReport.id == report_id,
        models.HealthReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if report.pdf_file_path and os.path.exists(report.pdf_file_path):
        try:
            os.remove(report.pdf_file_path)
        except Exception:
            pass

    db.delete(report)
    db.commit()
    return None
