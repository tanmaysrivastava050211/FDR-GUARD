@echo off
echo ========================================================
echo    AICTE FDR-GUARD: Security Deposit Management System
echo    Smart India Hackathon (SIH 2026) Prototype
echo ========================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "FDR-Guard FastAPI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 >nul

echo Starting Next.js Frontend (Port 3000)...
start "FDR-Guard Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo All servers initialized:
echo - Frontend Portal: http://localhost:3000/login
echo - FastAPI Backend Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
