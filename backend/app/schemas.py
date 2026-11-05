from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    average_cycle_length: int = 28
    average_period_length: int = 5
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    tracking_goal: str = "track_cycle"
    medical_conditions: Optional[str] = None
    reminder_period_days_before: int = 2
    reminder_fertility_days_before: int = 1
    notification_email: bool = True
    notification_browser: bool = True

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileOut(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)

# --- Period Records ---
class PeriodRecordCreate(BaseModel):
    date: date
    flow_intensity: str = "medium"  # "spotting", "light", "medium", "heavy"
    pain_level: int = Field(0, ge=0, le=10)
    pad_tampon_count: Optional[int] = 0
    notes: Optional[str] = None

class PeriodRecordOut(BaseModel):
    id: int
    user_id: int
    cycle_id: Optional[int] = None
    date: date
    flow_intensity: str
    pain_level: int
    pad_tampon_count: Optional[int] = 0
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Menstrual Cycles ---
class CycleCreate(BaseModel):
    start_date: date
    end_date: Optional[date] = None
    period_duration_days: Optional[int] = 5
    notes: Optional[str] = None

class CycleOut(BaseModel):
    id: int
    user_id: int
    cycle_number: int
    start_date: date
    end_date: Optional[date] = None
    cycle_length_days: Optional[int] = None
    period_duration_days: Optional[int] = None
    estimated_ovulation_date: Optional[date] = None
    fertile_window_start: Optional[date] = None
    fertile_window_end: Optional[date] = None
    is_predicted: bool
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Symptoms & Logs ---
class SymptomOut(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    icon: str

    model_config = ConfigDict(from_attributes=True)

class SymptomLogCreate(BaseModel):
    symptom_id: int
    date: date
    severity: str = "mild"  # "mild", "moderate", "severe"
    notes: Optional[str] = None

class SymptomLogOut(BaseModel):
    id: int
    user_id: int
    symptom_id: int
    date: date
    severity: str
    notes: Optional[str] = None
    symptom: Optional[SymptomOut] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SymptomFrequency(BaseModel):
    symptom_name: str
    category: str
    count: int
    mild_count: int
    moderate_count: int
    severe_count: int

# --- Health Reminders ---
class HealthReminderCreate(BaseModel):
    reminder_type: str  # "period_expected", "ovulation_window", "medication", "doctor_appointment", "hydration", "custom"
    title: str
    message: Optional[str] = None
    reminder_date: date
    reminder_time: str = "09:00"
    is_recurring: bool = False
    recurrence_interval: str = "none"  # "daily", "weekly", "monthly", "none"

class HealthReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_time: Optional[str] = None
    is_completed: Optional[bool] = None
    is_active: Optional[bool] = None
    recurrence_interval: Optional[str] = None

class HealthReminderOut(BaseModel):
    id: int
    user_id: int
    reminder_type: str
    title: str
    message: Optional[str] = None
    reminder_date: date
    reminder_time: str
    is_recurring: bool
    recurrence_interval: str
    is_completed: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Health Reports ---
class HealthReportCreate(BaseModel):
    title: str
    report_type: str = "monthly_summary"  # "monthly_summary", "cycle_analysis", "symptom_trends", "doctor_export"
    start_date: date
    end_date: date

class HealthReportOut(BaseModel):
    id: int
    user_id: int
    title: str
    report_type: str
    start_date: date
    end_date: date
    summary_json: str
    pdf_file_path: Optional[str] = None
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Educational Content ---
class EducationalContentCreate(BaseModel):
    title: str
    slug: str
    category: str
    excerpt: str
    content_markdown: str
    read_time_minutes: int = 3
    is_featured: bool = False
    tags: Optional[str] = None

class EducationalContentOut(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    excerpt: str
    content_markdown: str
    read_time_minutes: int
    is_featured: bool
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- AI Chatbot ---
class ChatMessageIn(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    id: int
    role: str
    message: str
    disclaimer_included: bool
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Dashboard Summary ---
class DashboardSummary(BaseModel):
    current_cycle_day: Optional[int] = None
    phase_name: str = "Follicular Phase"
    phase_description: str = ""
    last_period_date: Optional[date] = None
    estimated_next_period: Optional[date] = None
    estimated_ovulation_date: Optional[date] = None
    fertile_window_start: Optional[date] = None
    fertile_window_end: Optional[date] = None
    is_in_fertile_window: bool = False
    chance_of_conception: str = "Low"  # "Low", "Medium", "High", "Peak"
    average_cycle_length: int = 28
    average_period_length: int = 5
    cycle_history: List[CycleOut] = []
    recent_period_records: List[PeriodRecordOut] = []
    recent_symptoms: List[SymptomLogOut] = []
    upcoming_reminders: List[HealthReminderOut] = []
    insights: List[str] = []
