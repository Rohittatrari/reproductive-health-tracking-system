@echo off
title Reproductive Health Tracking System
color 0D
echo ========================================================
echo    🌸 REPRODUCTIVE HEALTH TRACKING SYSTEM 🌸
echo ========================================================
echo.
echo Starting FastAPI Backend + React Web Client...
echo.

cd /d "%~dp0backend"
start "" http://localhost:8000
"..\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
