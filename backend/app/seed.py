from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app import models
from app.auth import get_password_hash
from app.cycle_calculator import estimate_cycle_dates

SYMPTOMS_DATA = [
    {"name": "Cramps", "category": "physical", "icon": "Flame", "description": "Uterine contractions causing lower abdominal aching or sharp sensations."},
    {"name": "Headache", "category": "physical", "icon": "Brain", "description": "Dull ache or throbbing head pain associated with estrogen fluctuations."},
    {"name": "Mood Changes", "category": "emotional", "icon": "Smile", "description": "Emotional shifts, irritability, or feelings of heightened sensitivity."},
    {"name": "Fatigue", "category": "energy", "icon": "BatteryLow", "description": "General lack of energy, sluggishness, or need for extra rest."},
    {"name": "Acne", "category": "skin", "icon": "Sparkles", "description": "Skin breakouts, particularly around the jawline and chin due to androgen shifts."},
    {"name": "Bloating", "category": "digestive", "icon": "Waves", "description": "Feeling of abdominal fullness or water retention caused by progesterone."},
    {"name": "Breast Tenderness", "category": "physical", "icon": "Heart", "description": "Soreness, fullness, or sensitivity in the breasts prior to menstruation."},
    {"name": "Nausea", "category": "digestive", "icon": "AlertCircle", "description": "Mild stomach queasiness or sensitivity to strong smells."},
    {"name": "Insomnia", "category": "energy", "icon": "Moon", "description": "Difficulty falling or staying asleep during the late luteal phase."},
    {"name": "Food Cravings", "category": "digestive", "icon": "Utensils", "description": "Strong desires for carbohydrates, sweets, or salty foods before menstruation."},
    {"name": "Backache", "category": "physical", "icon": "Activity", "description": "Lower back strain or tightness radiating from pelvic contractions."},
    {"name": "Anxiety", "category": "emotional", "icon": "ShieldAlert", "description": "Heightened restlessness, worry, or tension during hormone shifts."}
]

ARTICLES_DATA = [
    {
        "title": "Understanding the 4 Menstrual Cycle Phases",
        "slug": "understanding-menstrual-cycle-phases",
        "category": "menstrual_health",
        "excerpt": "A deep dive into the Menstrual, Follicular, Ovulatory, and Luteal phases and how each influences your energy and physiology.",
        "content_markdown": """# Understanding the 4 Phases of Your Menstrual Cycle

The menstrual cycle is not merely your period—it is a continuous monthly rhythm controlled by the hypothalamic-pituitary-ovarian (HPO) axis.

### 1. Menstrual Phase (Days 1–5)
• **Hormones:** Estrogen and progesterone drop to baseline levels.  
• **What happens:** The endometrium (uterine lining) sheds.  
• **Wellness tip:** Prioritize restorative rest, warm nourishing soups, and iron-rich foods (spinach, lentils) to replenish lost iron.

### 2. Follicular Phase (Days 1–13)
• **Hormones:** Follicle-Stimulating Hormone (FSH) stimulates ovarian follicles. Estrogen progressively rises.  
• **What happens:** As estrogen surges, energy, mental clarity, and collagen production increase.  
• **Wellness tip:** Ideal time for creative projects, aerobic exercise, and strength training.

### 3. Ovulatory Phase (Around Day 14)
• **Hormones:** Luteinizing Hormone (LH) spikes dramatically; estrogen peaks.  
• **What happens:** The mature follicle ruptures, releasing an ovum into the fallopian tube.  
• **Fertility note:** Conception is possible from sexual intercourse occurring in the 5 days prior to ovulation plus ovulation day itself.

### 4. Luteal Phase (Days 15–28)
• **Hormones:** Progesterone dominates, manufactured by the corpus luteum.  
• **What happens:** The body prepares for a possible pregnancy. If conception does not occur, hormone levels drop, triggering the next period.  
• **Wellness tip:** Eat complex carbohydrates and magnesium-rich seeds to buffer against premenstrual mood shifts.
""",
        "read_time_minutes": 5,
        "is_featured": True,
        "tags": "cycle, phases, hormones, biology"
    },
    {
        "title": "PCOS vs. Endometriosis: Recognizing the Differences",
        "slug": "pcos-vs-endometriosis-awareness",
        "category": "pcos_endometriosis",
        "excerpt": "Learn the symptoms, diagnosis paths, and clinical distinctions between Polycystic Ovary Syndrome and Endometriosis.",
        "content_markdown": """# PCOS and Endometriosis: Key Differences and Clinical Awareness

While both conditions affect reproductive health and can cause discomfort or fertility challenges, their underlying biology is distinct.

### Polycystic Ovary Syndrome (PCOS)
• **Nature:** Endocrine and metabolic disorder marked by hormonal imbalance and insulin resistance.  
• **Hallmark Signs:** Irregular periods or skipped cycles, excess androgen levels (facial hair, cystic acne), polycystic appearance on ultrasound.  
• **Management:** Low-glycemic dietary approaches, regular physical activity, and medical guidance (metformin, cycle-regulating therapies).

### Endometriosis
• **Nature:** Chronic inflammatory condition where endometrial-like tissue implants outside the uterus on pelvic organs.  
• **Hallmark Signs:** Debilitating menstrual pain (dysmenorrhea), pain during or after intercourse, chronic pelvic discomfort, heavy or irregular bleeding.  
• **Management:** Laparoscopic excision, hormonal suppression, physical therapy, and anti-inflammatory strategies.

### When to Seek Medical Evaluation
Severe pain that disrupts work, school, or daily living is **never normal**. Consult a licensed gynecologist for specialized ultrasound, hormone panels, or diagnostic evaluation.
""",
        "read_time_minutes": 6,
        "is_featured": True,
        "tags": "pcos, endometriosis, pelvic pain, health"
    },
    {
        "title": "Demystifying Fertility Awareness & The Fertile Window",
        "slug": "demystifying-fertility-awareness",
        "category": "pregnancy_fertility",
        "excerpt": "Explore the biological facts of human conception, sperm survival times, and how cycle tracking works.",
        "content_markdown": """# Demystifying Fertility Awareness and The Fertile Window

Understanding when ovulation occurs allows individuals to either optimize conception or better recognize bodily shifts.

### The Biological Fertile Window
Human conception depends on two critical timelines:
1. **Sperm viability:** Sperm can live in alkaline cervical mucus for up to 5 days.  
2. **Egg viability:** An unfertilized ovum survives for 12 to 24 hours after release.

Therefore, the biological fertile window spans **6 days total** (5 days before ovulation + the day of ovulation).

### Biological Biomarkers
• **Cervical Mucus:** Changes from dry/sticky post-period to clear, slippery, and stretchy 'egg-white' texture near ovulation.  
• **Basal Body Temperature:** Rises ~0.5°F–1°F after ovulation due to progesterone production, confirming ovulation in retrospect.  
• **LH Strips:** Detect the luteinizing hormone surge 24–36 hours before release.

### Important Contraceptive Advisory
Cycle tracker calculations provide mathematical estimates. Natural variations caused by stress, illness, or travel can shift ovulation timing unexpectedly. Fertility predictions should **never be used as a primary contraception method**.
""",
        "read_time_minutes": 4,
        "is_featured": True,
        "tags": "fertility, ovulation, conception, family planning"
    },
    {
        "title": "Comprehensive Guide to Menstrual Hygiene and TSS Safety",
        "slug": "menstrual-hygiene-and-tss-safety",
        "category": "hygiene_preventive",
        "excerpt": "Best practices for using pads, tampons, cups, and discs safely, plus key warning signs of Toxic Shock Syndrome.",
        "content_markdown": """# Menstrual Hygiene & Preventive Healthcare Guide

Maintaining good menstrual hygiene is essential for comfort, odor prevention, and protecting reproductive health.

### Safe Product Practices
• **Sanitary Pads:** Change pads every 4 to 6 hours to prevent bacterial accumulation and chafing.  
• **Tampons:** Use the lowest absorbency suitable for your flow. Always change within 4 to 8 hours. Never leave a tampon inserted longer than 8 hours.  
• **Menstrual Cups & Discs:** Wash thoroughly with fragrance-free soap when emptying every 8–12 hours. Boil in water for 5–10 minutes between monthly cycles.

### Toxic Shock Syndrome (TSS) Awareness
TSS is a rare but life-threatening complication of certain bacterial infections (Staphylococcus aureus or Streptococcus).

**Warning Signs of TSS:**
• Sudden high fever (over 102°F / 38.9°C)  
• Vomiting or watery diarrhea  
• Sunburn-like rash across the body or palms  
• Dizziness, rapid heart rate, or fainting  

*If you experience these symptoms while wearing a tampon or menstrual cup, remove the product immediately and seek emergency medical care.*
""",
        "read_time_minutes": 4,
        "is_featured": False,
        "tags": "hygiene, tampons, cups, tss, safety"
    },
    {
        "title": "Hormones 101: Estrogen, Progesterone, and PMS",
        "slug": "hormones-101-estrogen-progesterone-pms",
        "category": "hormonal_changes",
        "excerpt": "How the chemical messengers in your body direct mood, energy, skin, and sleep throughout the month.",
        "content_markdown": """# Hormones 101: Estrogen, Progesterone, and PMS

Hormones act as biochemical messengers that communicate between the brain, ovaries, and target tissues throughout the body.

### The Big Two
1. **Estrogen:** The energizing, mood-elevating, and bone-preserving hormone. Peaks just before ovulation. Promotes skin elasticity and mental alertness.  
2. **Progesterone:** The calming, relaxing, and uterine-supportive hormone. Produced after ovulation. In some individuals, the steep drop in progesterone right before menstruation triggers irritability, fluid retention, and cravings.

### Managing PMS Effectively
• **Magnesium (300-400mg daily):** Supports nervous system calming and eases uterine muscle spasms.  
• **Hydration & Salt Balance:** Moderate sodium intake during the late luteal phase helps reduce bloating and breast tenderness.  
• **Gentle Movement:** Walking, swimming, or restorative yoga stimulates endorphin release to combat luteal lethargy.
""",
        "read_time_minutes": 5,
        "is_featured": False,
        "tags": "hormones, pms, estrogen, progesterone"
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Symptoms Catalog
        for s_data in SYMPTOMS_DATA:
            existing = db.query(models.Symptom).filter(models.Symptom.name == s_data["name"]).first()
            if not existing:
                symptom = models.Symptom(**s_data)
                db.add(symptom)
        db.commit()

        # 2. Seed Educational Articles
        for a_data in ARTICLES_DATA:
            existing = db.query(models.EducationalContent).filter(models.EducationalContent.slug == a_data["slug"]).first()
            if not existing:
                article = models.EducationalContent(**a_data)
                db.add(article)
        db.commit()

        # 3. Seed Admin User
        admin_email = "admin@health.org"
        admin = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin:
            admin = models.User(
                email=admin_email,
                hashed_password=get_password_hash("Admin@12345"),
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            admin_profile = models.UserProfile(
                user_id=admin.id,
                average_cycle_length=28,
                average_period_length=5,
                tracking_goal="monitor_health"
            )
            db.add(admin_profile)
            db.commit()

        # 4. Seed Demo User with realistic historical cycle and symptom data
        demo_email = "demo@health.org"
        demo = db.query(models.User).filter(models.User.email == demo_email).first()
        if not demo:
            demo = models.User(
                email=demo_email,
                hashed_password=get_password_hash("Demo@12345"),
                full_name="Sarah Jenkins",
                role="user",
                is_active=True
            )
            db.add(demo)
            db.commit()
            db.refresh(demo)

            demo_profile = models.UserProfile(
                user_id=demo.id,
                date_of_birth=date(1997, 6, 14),
                average_cycle_length=28,
                average_period_length=5,
                height_cm=165.0,
                weight_kg=58.5,
                tracking_goal="track_cycle",
                medical_conditions="None reported",
                reminder_period_days_before=2,
                reminder_fertility_days_before=1
            )
            db.add(demo_profile)
            db.commit()

            # Seed 3 realistic historical cycles leading up to current date
            today = date.today()
            # Cycle 1: 56 days ago
            c1_start = today - timedelta(days=56)
            c1_end = c1_start + timedelta(days=27)
            c1_est = estimate_cycle_dates(c1_start, 28, 5)
            cycle1 = models.MenstrualCycle(
                user_id=demo.id,
                cycle_number=1,
                start_date=c1_start,
                end_date=c1_end,
                cycle_length_days=28,
                period_duration_days=5,
                estimated_ovulation_date=c1_est["estimated_ovulation_date"],
                fertile_window_start=c1_est["fertile_window_start"],
                fertile_window_end=c1_est["fertile_window_end"],
                notes="Normal regular cycle. Mild cramping on Day 1."
            )
            db.add(cycle1)

            # Cycle 2: 28 days ago
            c2_start = today - timedelta(days=28)
            c2_end = c2_start + timedelta(days=27)
            c2_est = estimate_cycle_dates(c2_start, 28, 5)
            cycle2 = models.MenstrualCycle(
                user_id=demo.id,
                cycle_number=2,
                start_date=c2_start,
                end_date=c2_end,
                cycle_length_days=28,
                period_duration_days=5,
                estimated_ovulation_date=c2_est["estimated_ovulation_date"],
                fertile_window_start=c2_est["fertile_window_start"],
                fertile_window_end=c2_est["fertile_window_end"],
                notes="Light flow on day 4-5."
            )
            db.add(cycle2)

            # Current Cycle: started 12 days ago (now around day 12-13, near follicular/ovulation!)
            c3_start = today - timedelta(days=12)
            c3_est = estimate_cycle_dates(c3_start, 28, 5)
            cycle3 = models.MenstrualCycle(
                user_id=demo.id,
                cycle_number=3,
                start_date=c3_start,
                end_date=None,
                period_duration_days=5,
                estimated_ovulation_date=c3_est["estimated_ovulation_date"],
                fertile_window_start=c3_est["fertile_window_start"],
                fertile_window_end=c3_est["fertile_window_end"],
                notes="Active ongoing cycle."
            )
            db.add(cycle3)
            db.commit()

            # Seed period days for current cycle
            for day_offset in range(5):
                p_date = c3_start + timedelta(days=day_offset)
                intensity = "heavy" if day_offset in (0, 1) else ("medium" if day_offset == 2 else "light")
                pain = 5 if day_offset == 0 else (3 if day_offset == 1 else 0)
                prec = models.PeriodRecord(
                    user_id=demo.id,
                    cycle_id=cycle3.id,
                    date=p_date,
                    flow_intensity=intensity,
                    pain_level=pain,
                    pad_tampon_count=3
                )
                db.add(prec)

            # Seed symptoms for demo user
            cramp_sym = db.query(models.Symptom).filter(models.Symptom.name == "Cramps").first()
            headache_sym = db.query(models.Symptom).filter(models.Symptom.name == "Headache").first()
            fatigue_sym = db.query(models.Symptom).filter(models.Symptom.name == "Fatigue").first()
            mood_sym = db.query(models.Symptom).filter(models.Symptom.name == "Mood Changes").first()

            if cramp_sym:
                db.add(models.SymptomLog(user_id=demo.id, symptom_id=cramp_sym.id, date=c3_start, severity="moderate", notes="Lower abdominal cramping."))
            if fatigue_sym:
                db.add(models.SymptomLog(user_id=demo.id, symptom_id=fatigue_sym.id, date=c3_start + timedelta(days=1), severity="moderate", notes="Low energy."))
            if mood_sym:
                db.add(models.SymptomLog(user_id=demo.id, symptom_id=mood_sym.id, date=today - timedelta(days=2), severity="mild", notes="Felt slightly irritable."))

            # Seed sample reminders
            rem1 = models.HealthReminder(
                user_id=demo.id,
                reminder_type="period_expected",
                title="Upcoming Period Expected",
                message="Your estimated period starts in ~16 days. Keep supplies ready.",
                reminder_date=today + timedelta(days=14),
                reminder_time="09:00",
                is_recurring=False,
                is_completed=False,
                is_active=True
            )
            rem2 = models.HealthReminder(
                user_id=demo.id,
                reminder_type="medication",
                title="Daily Iron & Vitamin D",
                message="Take with breakfast to support energy levels and hemoglobin.",
                reminder_date=today,
                reminder_time="08:00",
                is_recurring=True,
                recurrence_interval="daily",
                is_completed=False,
                is_active=True
            )
            rem3 = models.HealthReminder(
                user_id=demo.id,
                reminder_type="ovulation_window",
                title="Approaching Fertile Window",
                message="Estimated ovulation is in 2 days. Track basal body temperature.",
                reminder_date=today + timedelta(days=2),
                reminder_time="09:30",
                is_recurring=False,
                is_completed=False,
                is_active=True
            )
            db.add_all([rem1, rem2, rem3])
            db.commit()

        print("Database seeded successfully with default symptoms, educational articles, and demo accounts.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
