import os
from datetime import datetime, date
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from app.config import settings

def generate_health_report_pdf(
    user_name: str,
    user_email: str,
    report_title: str,
    start_date: date,
    end_date: date,
    stats: Dict[str, Any],
    cycle_records: List[Dict[str, Any]],
    symptom_summary: List[Dict[str, Any]]
) -> str:
    """
    Generates a professional, clinical-grade PDF health report for the user or their healthcare provider.
    Returns the file path of the generated PDF.
    """
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_name = "".join(c for c in user_name if c.isalnum() or c in ("-", "_")).rstrip()
    filename = f"report_{safe_name}_{timestamp}.pdf"
    filepath = os.path.join(settings.REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#7C3AED")     # Violet-600
    secondary_color = colors.HexColor("#DB2777")   # Pink-600
    text_color = colors.HexColor("#1F2937")        # Gray-800
    light_bg = colors.HexColor("#F3E8FF")          # Violet-100
    muted_color = colors.HexColor("#6B7280")       # Gray-500

    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=TA_LEFT
    )

    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=muted_color,
        alignment=TA_LEFT
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_color
    )

    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=muted_color,
        alignment=TA_CENTER
    )

    elements = []

    # Header
    elements.append(Paragraph(f"<b>{settings.PROJECT_NAME}</b>", title_style))
    elements.append(Paragraph(f"Personalized Clinical & Cycle Summary Report • {report_title}", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=10))

    # Patient / User Information Table
    info_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {user_name}", body_style),
            Paragraph(f"<b>Report Date:</b> {datetime.utcnow().strftime('%B %d, %Y')}", body_style)
        ],
        [
            Paragraph(f"<b>Account:</b> {user_email}", body_style),
            Paragraph(f"<b>Reporting Window:</b> {start_date} to {end_date}", body_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF5FF")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#DDD6FE")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#EDE9FE")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 12))

    # Metric Highlights Card Table
    elements.append(Paragraph("1. Menstrual Cycle Overview & Metrics", heading_style))
    avg_cycle = stats.get("average_cycle_length", "28")
    avg_period = stats.get("average_period_length", "5")
    regularity = "Regular" if stats.get("is_regular", True) else "Irregular (high variance)"
    cycle_count = stats.get("completed_cycle_count", 0)

    metrics_data = [
        [
            Paragraph("<b>Average Cycle Length</b>", body_style),
            Paragraph(f"<b>{avg_cycle} days</b>", body_style),
            Paragraph("<b>Average Period Flow</b>", body_style),
            Paragraph(f"<b>{avg_period} days</b>", body_style),
        ],
        [
            Paragraph("<b>Cycle Regularity</b>", body_style),
            Paragraph(f"{regularity}", body_style),
            Paragraph("<b>Logged Cycles</b>", body_style),
            Paragraph(f"{cycle_count} cycles", body_style),
        ]
    ]
    metrics_table = Table(metrics_data, colWidths=[135, 135, 135, 135])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#C4B5FD")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E9D5FF")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(metrics_table)
    elements.append(Spacer(1, 12))

    # Cycle History Table
    elements.append(Paragraph("2. Recent Menstrual Cycle History", heading_style))
    cycle_table_rows = [
        [
            Paragraph("<b>#</b>", body_style),
            Paragraph("<b>Start Date</b>", body_style),
            Paragraph("<b>End Date</b>", body_style),
            Paragraph("<b>Cycle Length</b>", body_style),
            Paragraph("<b>Duration</b>", body_style),
            Paragraph("<b>Estimated Ovulation</b>", body_style)
        ]
    ]
    if cycle_records:
        for c in cycle_records[:8]:
            cycle_table_rows.append([
                Paragraph(str(c.get("cycle_number", "-")), body_style),
                Paragraph(str(c.get("start_date", "-")), body_style),
                Paragraph(str(c.get("end_date", "Ongoing")), body_style),
                Paragraph(f"{c.get('cycle_length_days')} days" if c.get('cycle_length_days') else "-", body_style),
                Paragraph(f"{c.get('period_duration_days')} days" if c.get('period_duration_days') else "-", body_style),
                Paragraph(str(c.get("estimated_ovulation_date", "-")), body_style)
            ])
    else:
        cycle_table_rows.append([
            Paragraph("No cycle records logged in this timeframe.", body_style),
            Paragraph("", body_style), Paragraph("", body_style),
            Paragraph("", body_style), Paragraph("", body_style), Paragraph("", body_style)
        ])

    cycle_table = Table(cycle_table_rows, colWidths=[30, 95, 95, 95, 85, 140])
    cycle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), light_bg),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(cycle_table)
    elements.append(Spacer(1, 12))

    # Symptom Analytics Table
    elements.append(Paragraph("3. Logged Symptom Trends & Frequency", heading_style))
    symptom_rows = [
        [
            Paragraph("<b>Symptom</b>", body_style),
            Paragraph("<b>Category</b>", body_style),
            Paragraph("<b>Total Occurrences</b>", body_style),
            Paragraph("<b>Mild</b>", body_style),
            Paragraph("<b>Moderate</b>", body_style),
            Paragraph("<b>Severe</b>", body_style)
        ]
    ]
    if symptom_summary:
        for s in symptom_summary[:10]:
            symptom_rows.append([
                Paragraph(f"<b>{s.get('symptom_name', '-')}</b>", body_style),
                Paragraph(str(s.get("category", "-")).capitalize(), body_style),
                Paragraph(str(s.get("count", 0)), body_style),
                Paragraph(str(s.get("mild_count", 0)), body_style),
                Paragraph(str(s.get("moderate_count", 0)), body_style),
                Paragraph(str(s.get("severe_count", 0)), body_style)
            ])
    else:
        symptom_rows.append([
            Paragraph("No symptoms logged during this period.", body_style),
            Paragraph("", body_style), Paragraph("", body_style),
            Paragraph("", body_style), Paragraph("", body_style), Paragraph("", body_style)
        ])

    sym_table = Table(symptom_rows, colWidths=[120, 90, 110, 70, 70, 80])
    sym_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#FCE7F3")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#FBCFE8")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#FDF2F8")),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(sym_table)
    elements.append(Spacer(1, 16))

    # Clinical Medical Disclaimer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceBefore=10, spaceAfter=8))
    elements.append(Paragraph(
        "<b>Medical Disclaimer:</b> This document is generated for personal tracking and health awareness purposes only. "
        "Calculated fertility dates and cycle metrics are estimations based on user entries and standard physiological models. "
        "This report is not a clinical diagnostic tool, does not guarantee pregnancy prevention, and should be shared "
        "with a qualified OB/GYN or licensed healthcare provider for clinical evaluation.",
        disclaimer_style
    ))

    doc.build(elements)
    return filepath
