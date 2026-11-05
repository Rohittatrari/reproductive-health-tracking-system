Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "   🌸 REPRODUCTIVE HEALTH TRACKING SYSTEM 🌸" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Starting FastAPI Application Server on http://localhost:8000..." -ForegroundColor Cyan

Start-Process "http://localhost:8000"

Set-Location -Path "$PSScriptRoot\backend"
& "..\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
