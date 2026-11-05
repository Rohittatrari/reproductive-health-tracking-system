from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime, Float, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # "user", "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cycles = relationship("MenstrualCycle", back_populates="user", cascade="all, delete-orphan", order_by="desc(MenstrualCycle.start_date)")
    period_records = relationship("PeriodRecord", back_populates="user", cascade="all, delete-orphan", order_by="desc(PeriodRecord.date)")
    symptom_logs = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan", order_by="desc(SymptomLog.date)")
    health_reminders = relationship("HealthReminder", back_populates="user", cascade="all, delete-orphan", order_by="HealthReminder.reminder_date")
    health_reports = relationship("HealthReport", back_populates="user", cascade="all, delete-orphan", order_by="desc(HealthReport.generated_at)")
    conversations = relationship("ChatbotConversation", back_populates="user", cascade="all, delete-orphan", order_by="ChatbotConversation.timestamp")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=True)
    average_cycle_length = Column(Integer, default=28, nullable=False)
    average_period_length = Column(Integer, default=5, nullable=False)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    tracking_goal = Column(String(100), default="track_cycle", nullable=False)  # "track_cycle", "conceive", "prevent_pregnancy", "monitor_health"
    medical_conditions = Column(Text, nullable=True)  # Comma-separated or JSON string, e.g. "PCOS, Endometriosis"
    reminder_period_days_before = Column(Integer, default=2, nullable=False)
    reminder_fertility_days_before = Column(Integer, default=1, nullable=False)
    notification_email = Column(Boolean, default=True, nullable=False)
    notification_browser = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")


class MenstrualCycle(Base):
    __tablename__ = "menstrual_cycles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_number = Column(Integer, default=1, nullable=False)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    cycle_length_days = Column(Integer, nullable=True)
    period_duration_days = Column(Integer, nullable=True)
    estimated_ovulation_date = Column(Date, nullable=True)
    fertile_window_start = Column(Date, nullable=True)
    fertile_window_end = Column(Date, nullable=True)
    is_predicted = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="cycles")
    period_records = relationship("PeriodRecord", back_populates="cycle")


class PeriodRecord(Base):
    __tablename__ = "period_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_id = Column(Integer, ForeignKey("menstrual_cycles.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    flow_intensity = Column(String(50), default="medium", nullable=False)  # "spotting", "light", "medium", "heavy"
    pain_level = Column(Integer, default=0, nullable=False)  # 0 to 10
    pad_tampon_count = Column(Integer, default=0, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="period_records")
    cycle = relationship("MenstrualCycle", back_populates="period_records")


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)  # "physical", "emotional", "digestive", "skin", "energy"
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Activity", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    logs = relationship("SymptomLog", back_populates="symptom", cascade="all, delete-orphan")


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symptom_id = Column(Integer, ForeignKey("symptoms.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    severity = Column(String(50), default="mild", nullable=False)  # "mild", "moderate", "severe"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="symptom_logs")
    symptom = relationship("Symptom", back_populates="logs")


class HealthReminder(Base):
    __tablename__ = "health_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reminder_type = Column(String(50), nullable=False)  # "period_expected", "ovulation_window", "medication", "doctor_appointment", "hydration", "custom"
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    reminder_date = Column(Date, nullable=False, index=True)
    reminder_time = Column(String(20), default="09:00", nullable=False)
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_interval = Column(String(50), default="none", nullable=False)  # "daily", "weekly", "monthly", "none"
    is_completed = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="health_reminders")


class HealthReport(Base):
    __tablename__ = "health_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="monthly_summary", nullable=False)  # "monthly_summary", "cycle_analysis", "symptom_trends", "doctor_export"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    summary_json = Column(Text, nullable=False)  # JSON string of stats
    pdf_file_path = Column(String(500), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="health_reports")


class EducationalContent(Base):
    __tablename__ = "educational_content"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # "menstrual_health", "reproductive_health", "hormonal_changes", "pcos_endometriosis", "pregnancy_fertility", "hygiene_preventive"
    excerpt = Column(Text, nullable=False)
    content_markdown = Column(Text, nullable=False)
    read_time_minutes = Column(Integer, default=3, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ChatbotConversation(Base):
    __tablename__ = "chatbot_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user", "assistant"
    message = Column(Text, nullable=False)
    disclaimer_included = Column(Boolean, default=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
