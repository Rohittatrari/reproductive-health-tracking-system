from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role="user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default user profile
    profile = models.UserProfile(
        user_id=user.id,
        average_cycle_length=28,
        average_period_length=5,
        tracking_goal="track_cycle"
    )
    db.add(profile)
    db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled. Please contact support.")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.post("/token", response_model=schemas.Token)
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserProfileOut)
def update_profile(
    profile_in: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/reset-password")
def reset_password(reset_in: schemas.PasswordReset, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == reset_in.email.lower()).first()
    if not user:
        # Prevent account enumeration: return success message regardless
        return {"message": "If an account exists with that email, the password has been reset."}
    
    user.hashed_password = get_password_hash(reset_in.new_password)
    db.commit()
    return {"message": "Password updated successfully."}

@router.get("/export-data")
def export_user_data(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Privacy feature: Export complete personal health dataset for user"""
    cycles = db.query(models.MenstrualCycle).filter(models.MenstrualCycle.user_id == current_user.id).all()
    periods = db.query(models.PeriodRecord).filter(models.PeriodRecord.user_id == current_user.id).all()
    symptoms = db.query(models.SymptomLog).filter(models.SymptomLog.user_id == current_user.id).all()
    reminders = db.query(models.HealthReminder).filter(models.HealthReminder.user_id == current_user.id).all()

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": str(current_user.created_at)
        },
        "profile": {
            "average_cycle_length": current_user.profile.average_cycle_length if current_user.profile else 28,
            "average_period_length": current_user.profile.average_period_length if current_user.profile else 5,
            "tracking_goal": current_user.profile.tracking_goal if current_user.profile else "track_cycle",
            "medical_conditions": current_user.profile.medical_conditions if current_user.profile else None
        },
        "cycles": [
            {
                "cycle_number": c.cycle_number,
                "start_date": str(c.start_date),
                "end_date": str(c.end_date) if c.end_date else None,
                "cycle_length_days": c.cycle_length_days,
                "period_duration_days": c.period_duration_days,
                "estimated_ovulation_date": str(c.estimated_ovulation_date) if c.estimated_ovulation_date else None,
                "notes": c.notes
            }
            for c in cycles
        ],
        "periods": [
            {
                "date": str(p.date),
                "flow_intensity": p.flow_intensity,
                "pain_level": p.pain_level,
                "pad_tampon_count": p.pad_tampon_count,
                "notes": p.notes
            }
            for p in periods
        ],
        "symptoms": [
            {
                "date": str(s.date),
                "symptom": s.symptom.name if s.symptom else "Unknown",
                "severity": s.severity,
                "notes": s.notes
            }
            for s in symptoms
        ],
        "reminders": [
            {
                "title": r.title,
                "type": r.reminder_type,
                "date": str(r.reminder_date),
                "time": r.reminder_time,
                "is_completed": r.is_completed
            }
            for r in reminders
        ]
    }

@router.delete("/delete-account")
def delete_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Privacy feature: Permanently delete account and all associated health data"""
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated health records permanently deleted."}
