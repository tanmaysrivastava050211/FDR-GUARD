Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   AICTE FDR-GUARD: Security Deposit Management System   " -ForegroundColor Cyan
Write-Host "   Smart India Hackathon (SIH 2026) Prototype           " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "1. Starting FastAPI Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspace\backend'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "2. Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$workspace\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Both servers launched in background windows:" -ForegroundColor Green
Write-Host " - Frontend Portal:       http://localhost:3000/login" -ForegroundColor White
Write-Host " - Backend API Docs:      http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host " - Backend Health Check:  http://127.0.0.1:8000/health" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
