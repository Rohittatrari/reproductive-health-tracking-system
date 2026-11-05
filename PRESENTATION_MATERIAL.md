# Final-Year Project Presentation & Viva Defense Material

## Project Title: Reproductive Health Tracking System (AuraHealth)
**Domain:** Healthcare Informatics / Web & Mobile Health Technologies  
**Technology Stack:** React.js, Tailwind CSS, Recharts, Python, FastAPI, SQLAlchemy, PostgreSQL / SQLite, ReportLab, JWT Authentication  

---

## 🎯 Executive Summary & Problem Statement

### The Problem
Menstrual and reproductive health impacts over 1.9 billion individuals globally. Despite its universality, significant gaps remain:
1. **Lack of Cycle Awareness:** Many individuals do not track cycle regularity, hindering early diagnosis of conditions like Polycystic Ovary Syndrome (PCOS) and Endometriosis (which takes an average of 7 to 10 years to clinically diagnose).
2. **Misconceptions in Fertility Awareness:** Widespread misunderstandings regarding the fertile window and ovulation lead to unintended pregnancies or unnecessary anxiety.
3. **Privacy Vulnerabilities:** Many commercial period-tracking applications sell sensitive user reproductive data to third-party advertisers or data brokers.
4. **Poor Clinical Communication:** Patients often struggle to recall symptom frequency and pain severity when visiting their gynecologist.

### The Solution: AuraHealth
A modern, privacy-preserving, and clinically oriented reproductive tracking platform providing:
- Automated cycle metrics and predictive modeling.
- Daily symptom monitoring with graphical trend visualization.
- Biologically grounded fertility estimates with explicit medical warnings.
- Downloadable clinical PDF reports to facilitate doctor-patient consultations.
- An educational knowledge hub with a safety-first AI health assistant.
- Self-sovereign data privacy with instant GDPR data export and account erasure.

---

## 📊 Presentation Slides Outline (Slide by Slide)

### Slide 1: Title & Team
- **Title:** Reproductive Health Tracking & Clinical Awareness System
- **Subtitle:** An Intelligent, Privacy-First Healthcare Informatics Platform
- **Presented by:** [Your Name / Team Members]
- **Supervisor:** [Supervisor Name]
- **Department:** Computer Science & Engineering / Information Technology

### Slide 2: Project Objectives
- Build a responsive, mobile-first single-page application with a calming healthcare aesthetic (soft purple/pink palette).
- Engineer a high-performance RESTful API using FastAPI and SQLAlchemy.
- Implement reliable mathematical models for cycle length analysis, ovulation timing, and fertile window projection.
- Integrate interactive health analytics (Recharts) and clinical-grade PDF generation (ReportLab).
- Ensure patient privacy via role-based authorization, bcrypt encryption, and zero third-party data tracking.

### Slide 3: System Architecture
```
+-------------------------------------------------------------------+
|                    Client Layer (React 19 SPA)                    |
|   Tailwind CSS  •  Recharts  •  React Router  •  Lucide Icons     |
+---------------------------------+---------------------------------+
                                  | HTTP / JSON (JWT Bearer)
                                  v
+---------------------------------+---------------------------------+
|               Backend API Gateway (FastAPI / ASGI)                |
|  - JWT Authentication & Bcrypt Password Hashing                   |
|  - Cycle & Fertility Algorithmic Engines                          |
|  - Symptom Analytics Aggregator                                   |
|  - ReportLab Clinical PDF Generator                               |
|  - AI Health Knowledge Assistant                                  |
+---------------------------------+---------------------------------+
                                  | SQLAlchemy 2.0 ORM
                                  v
+---------------------------------+---------------------------------+
|               Database Layer (PostgreSQL / SQLite)                |
|  10 Relational Tables  •  Foreign Keys  •  Cascading Deletion     |
+-------------------------------------------------------------------+
```

### Slide 4: Database Design (10 Core Entities)
1. `users` (Credentials & authorization roles)
2. `user_profiles` (Physiological settings & tracking goals)
3. `menstrual_cycles` (Period starts, ends, cycle duration, ovulation dates)
4. `period_records` (Daily flow intensity, pain scale 0-10, hygiene count)
5. `symptoms` (Catalog categorized into physical, emotional, digestive, etc.)
6. `symptom_logs` (Daily logged symptoms with severity: mild/mod/severe)
7. `health_reminders` (Notification schedule & auto-sync alerts)
8. `health_reports` (Compiled reports and persistent PDF records)
9. `educational_content` (Clinically verified articles in markdown)
10. `chatbot_conversations` (Conversational message history)

### Slide 5: Menstrual Cycle & Fertility Calculation Engine
- **Current Cycle Day Calculation:**
  $$\text{Day} = (\text{Today} - \text{Start Date}) + 1$$
- **Next Period Prediction:**
  $$\text{Next Period} = \text{Start Date} + \text{Average Cycle Length}$$
- **Ovulation Day Estimation (Luteal Phase Model):**
  $$\text{Ovulation Date} = \text{Next Period} - 14\text{ days}$$
- **Biological Fertile Window:**
  $$\text{Fertile Window} = [\text{Ovulation} - 5\text{ days},\, \text{Ovulation} + 1\text{ day}]$$
  *Explanation:* Human sperm survives up to 5 days in cervical mucus; the ovum survives ~24 hours post-ovulation.

### Slide 6: Security, Compliance & Privacy
- **Stateless Authentication:** PyJWT tokens with configurable expiry and HS256 signature verification.
- **Password Protection:** Irreversible adaptive salting and hashing via `bcrypt`.
- **Authorization Scopes:** Every user-specific query is strictly filtered by `current_user.id`.
- **Admin Privilege Isolation:** Administrative dashboard users can inspect aggregated platform metrics and activate/deactivate accounts, but can **never** view personal health logs or cycles.
- **GDPR Rights:** Instant full-dataset JSON export and permanent account deletion with cascading eradication.

### Slide 7: Live Demonstration Walkthrough
1. **Login & Role Access:** Single-click demo patient login & admin portal review.
2. **Dashboard Overview:** Dynamic cycle ring, phase detection, upcoming reminders.
3. **Interactive Calendar:** Monthly color-coded visualization with flow badges and pain indicators.
4. **Symptom Analytics:** Interactive stacked bar chart and category pie chart.
5. **PDF Export:** Generation and download of a clinical report formatted for medical consultations.
6. **AI Assistant:** Educational query testing with medical disclaimer guardrails.

### Slide 8: Future Scope & Conclusion
- Integration with wearable IoT health sensors (smart rings, Apple HealthKit, Google Health Connect) for automatic basal body temperature syncing.
- Offline-first Progressive Web App (PWA) with push notifications.
- Multilingual accessibility for rural community health programs.

---

## 🎓 Viva Voce Questions & Answers (Defense Preparation)

**Q1: Why did you choose FastAPI over Flask or Django?**  
*Answer:* FastAPI provides native asynchronous ASGI support, automatic OpenAPI/Swagger documentation, and high-performance serialization via Pydantic v2. It offers faster execution speeds comparable to NodeJS and Go, while maintaining clean and modular code architecture.

**Q2: How does the application estimate ovulation and the fertile window?**  
*Answer:* The algorithm uses the physiological standard that the luteal phase (time between ovulation and the next period) is relatively fixed at approximately 14 days. By calculating the user's historical average cycle length, we project the next period start date and subtract 14 days to determine estimated ovulation. Because sperm can live up to 5 days and the ovum lives up to 24 hours, the fertile window spans 5 days before ovulation up to 1 day after ovulation.

**Q3: How does the system handle irregular menstrual cycles?**  
*Answer:* The backend computes cycle variance across completed cycles. If variance exceeds 7 days, the system flags the cycle as "Irregular", updates the dashboard with personalized lifestyle guidance, and adjusts predictions to account for moving averages rather than static 28-day assumptions.

**Q4: How do you address patient privacy and data protection?**  
*Answer:* Reproductive data is highly sensitive. The system isolates tenant data on every database query using foreign key constraints and user ID claims extracted from verified JWT tokens. Administrative accounts are strictly restricted from reading personal patient symptom logs. Users have access to full JSON data export and permanent deletion.

**Q5: What is the purpose of the ReportLab PDF generator in this architecture?**  
*Answer:* Commercial apps often keep data trapped inside proprietary mobile screens. AuraHealth's PDF engine compiles cycle lengths, regularity metrics, symptom frequency distributions, and flow logs into a professional medical document that patients can easily share with their gynecologist during appointments.
