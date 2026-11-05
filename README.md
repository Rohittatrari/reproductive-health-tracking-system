# Reproductive Health Tracking System (AuraHealth)

A modern, secure, responsive, and full-featured **Reproductive Health Tracking System** designed to empower individuals with personalized menstrual cycle monitoring, symptom logging, fertility awareness calculations, downloadable clinical reports, health reminders, and an educational AI health assistant.

---

## 🌸 Key Modules & Features

1. **User Authentication & Privacy**
   - Secure JWT token-based authentication (`HS256`).
   - Strong password hashing via `bcrypt`.
   - Comprehensive User Profile management (cycle goals, medical condition flags like PCOS/Endometriosis).
   - **GDPR / Self-Sovereignty**: Complete JSON personal health data export and one-click account deletion with cascading wipe.

2. **Interactive Clinical Dashboard**
   - Current menstrual cycle day visual ring with active phase badge.
   - Dynamic countdown to next estimated period date.
   - Real-time fertile window indicator & conception likelihood calculation.
   - Summary cards of average cycle length and flow duration.
   - Quick logging buttons for immediate period and symptom entries.
   - Upcoming reminders list with one-tap completion.

3. **Menstrual Cycle Tracking & Interactive Calendar**
   - Monthly calendar view with color-coded day badges:
     - 🩸 Recorded period flow & pain rating.
     - ✨ Predicted future period dates.
     - 🌸 Fertile window span.
     - 🎯 Estimated ovulation day.
     - 🟣 Symptoms logged on that day.
   - Automatic cycle length calculation upon logging new cycle starts.
   - Historical cycle records archive with deletion controls.

4. **Symptom Tracking & Visual Analytics**
   - Comprehensive catalog: Cramps, Headaches, Mood Changes, Fatigue, Acne, Bloating, Breast Tenderness, Nausea, Insomnia, Food Cravings, Backache, Anxiety.
   - Multi-level severity tracking: *Mild*, *Moderate*, *Severe*.
   - **Interactive Charts (Recharts)**:
     - Stacked Bar Chart of top symptoms by severity.
     - Doughnut / Pie Chart of category breakdown (Physical, Emotional, Digestive, Energy, Skin).
     - Timeline trends.

5. **Fertility Awareness & Ovulation Estimator**
   - Computes fertile window based on physiological standards (sperm survival ~5 days + ovum lifespan 24 hours).
   - Calculates estimated ovulation date (14 days before next expected cycle).
   - Projects next 3 future fertile windows.
   - **Mandatory Safety Disclaimer**: Prominently highlights that cycle calculations are estimates and cannot be used as a primary contraception method.

6. **Health Reminders**
   - Custom reminders for expected period, ovulation window, medication, doctor/OB-GYN visits, and hydration.
   - **Auto-Sync Cycle Alerts**: One-click generation of automated notifications based on cycle forecasts.

7. **Clinical Reports & PDF Export**
   - Automated PDF generation via `ReportLab`.
   - Compiles patient summary, cycle metrics, cycle history tables, symptom frequency distributions, and clinical disclaimers.
   - Printable dossier ready for gynecological visits.

8. **Educational Health Library**
   - Verified medical guides across 6 categories: Menstrual Health, Reproductive Anatomy, Hormones & PMS, PCOS & Endometriosis, Pregnancy & Fertility, and Hygiene & TSS Safety.
   - **Personalized Recommendations**: Automatically suggests relevant guides based on user's logged symptoms and medical profile conditions.

9. **AI Health Assistant (Chatbot)**
   - Conversational assistant with rule-based expert clinical matching.
   - Answers questions regarding cycle phases, dysmenorrhea relief, fertility biomarkers, and PCOS.
   - Enforces medical disclaimers on every response.

10. **Administrator Dashboard**
    - High-level system usage metrics (users, cycles, symptoms, reports, queries).
    - User account management (activate/deactivate access) with privacy isolation (admins cannot view private health records).
    - Educational content publisher (create, edit, delete articles).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, React Router v7 |
| **Backend** | Python 3.11–3.14, FastAPI, SQLAlchemy 2.0, Pydantic v2, ReportLab |
| **Database** | PostgreSQL (Production / Docker) & SQLite (Zero-config local fallback) |
| **Auth** | JWT (PyJWT), Bcrypt password hashing |
| **Deployment** | Docker, Docker Compose, Windows Batch / PowerShell launcher |

---

## 🗄️ Database Design (10 PostgreSQL Tables)

1. `users` — Primary account credentials, email index, full name, role (`user`/`admin`), active status.
2. `user_profiles` — Personal cycle settings (average cycle length, period duration, tracking goal, medical conditions).
3. `menstrual_cycles` — Start date, end date, cycle length days, period duration, estimated ovulation date, fertile window start/end.
4. `period_records` — Daily bleeding logs: flow intensity (`spotting`, `light`, `medium`, `heavy`), pain level (0-10), pad/tampon count.
5. `symptoms` — Catalog of symptoms with categories and icons.
6. `symptom_logs` — User daily symptom entries with severity (`mild`, `moderate`, `severe`) and notes.
7. `health_reminders` — Reminder alerts, recurrence schedules, completion status.
8. `health_reports` — Generated health summaries and PDF file paths.
9. `educational_content` — Verified clinical articles, markdown text, categories, read times.
10. `chatbot_conversations` — Chat message history with role and timestamp.

---

## 🚀 Quickstart Guide

### Option 1: Direct Single-Click Launch (Windows)
Double-click `start_app.bat` or run:
```powershell
.\start_app.ps1
```
The FastAPI server will start on **http://localhost:8000** and automatically serve both the REST API, Swagger docs (`/docs`), and the built React frontend application!

### Option 2: Running with Python & Vite

#### 1. Backend:
```powershell
cd backend
..\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://localhost:8000/docs`

#### 2. Frontend (Dev Server with Hot-Reloading):
```powershell
cd frontend
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Option 3: Docker Compose (Full Stack with PostgreSQL)
```bash
docker-compose up --build
```

---

## 🔑 Default Credentials (Pre-Seeded)

The application automatically seeds the database with demo data on first startup:

| Account Type | Email | Password | Role |
|---|---|---|---|
| **Demo Patient (Sarah)** | `demo@health.org` | `Demo@12345` | User (3 pre-loaded cycles & symptoms) |
| **System Administrator** | `admin@health.org` | `Admin@12345` | Admin (Portal access) |

*You can also click the "Demo User" or "Admin User" buttons directly on the login page for instant one-click access.*

---

## 🧪 Testing

Run backend tests:
```powershell
cd backend
..\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```
Build frontend production bundle:
```powershell
cd frontend
npm run build
```
