-- ==========================================================
-- Reproductive Health Tracking System - PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+
-- ==========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    average_cycle_length INTEGER DEFAULT 28 NOT NULL,
    average_period_length INTEGER DEFAULT 5 NOT NULL,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    tracking_goal VARCHAR(100) DEFAULT 'track_cycle' NOT NULL,
    medical_conditions TEXT,
    reminder_period_days_before INTEGER DEFAULT 2 NOT NULL,
    reminder_fertility_days_before INTEGER DEFAULT 1 NOT NULL,
    notification_email BOOLEAN DEFAULT TRUE NOT NULL,
    notification_browser BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 3. Menstrual Cycles Table
CREATE TABLE IF NOT EXISTS menstrual_cycles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    cycle_number INTEGER DEFAULT 1 NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length_days INTEGER,
    period_duration_days INTEGER DEFAULT 5,
    estimated_ovulation_date DATE,
    fertile_window_start DATE,
    fertile_window_end DATE,
    is_predicted BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cycles_user_start ON menstrual_cycles(user_id, start_date DESC);

-- 4. Period Records Table (Daily tracking)
CREATE TABLE IF NOT EXISTS period_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    cycle_id INTEGER REFERENCES menstrual_cycles(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    flow_intensity VARCHAR(50) DEFAULT 'medium' NOT NULL,
    pain_level INTEGER DEFAULT 0 NOT NULL,
    pad_tampon_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_period_date UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_period_records_user_date ON period_records(user_id, date DESC);

-- 5. Symptoms Catalog Table
CREATE TABLE IF NOT EXISTS symptoms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Activity' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_symptoms_name ON symptoms(name);
CREATE INDEX IF NOT EXISTS idx_symptoms_category ON symptoms(category);

-- 6. Symptom Logs Table
CREATE TABLE IF NOT EXISTS symptom_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    symptom_id INTEGER REFERENCES symptoms(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    severity VARCHAR(50) DEFAULT 'mild' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_symptom_date UNIQUE (user_id, symptom_id, date)
);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date ON symptom_logs(user_id, date DESC);

-- 7. Health Reminders Table
CREATE TABLE IF NOT EXISTS health_reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    reminder_date DATE NOT NULL,
    reminder_time VARCHAR(20) DEFAULT '09:00' NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurrence_interval VARCHAR(50) DEFAULT 'none' NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON health_reminders(user_id, reminder_date);

-- 8. Health Reports Table
CREATE TABLE IF NOT EXISTS health_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) DEFAULT 'monthly_summary' NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    summary_json TEXT NOT NULL,
    pdf_file_path VARCHAR(500),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_user_gen ON health_reports(user_id, generated_at DESC);

-- 9. Educational Content Table
CREATE TABLE IF NOT EXISTS educational_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    excerpt TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    read_time_minutes INTEGER DEFAULT 3 NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    tags VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_edu_slug ON educational_content(slug);
CREATE INDEX IF NOT EXISTS idx_edu_category ON educational_content(category);

-- 10. Chatbot Conversations Table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    disclaimer_included BOOLEAN DEFAULT TRUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_user_time ON chatbot_conversations(user_id, timestamp);
