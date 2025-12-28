@echo off
REM Medical AI System Setup Script for Windows

echo ====================================
echo Medical AI Agent System Setup
echo ====================================
echo.

REM Change to project directory
cd /d "%~dp0medical-ai-system"

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment!
    pause
    exit /b 1
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [4/5] Installing Python dependencies (this may take several minutes)...
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo [WARNING] Some packages failed to install. Continuing...
)

echo [5/5] Setting up configuration files...
if not exist backend\orchestrator\.env (
    copy backend\orchestrator\.env.example backend\orchestrator\.env 2>nul
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Start Redis:        docker run -d -p 6379:6379 redis:alpine
echo 2. Start PostgreSQL:   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
echo 3. Start Orchestrator: cd backend\orchestrator ^& uvicorn app:app --reload
echo 4. Start Celery:       cd backend\orchestrator ^& celery -A celery_app worker --loglevel=info
echo 5. Start Agents:       Run each agent's app.py
echo 6. Open Frontend:      Open frontend\index.html in browser
echo.
echo For detailed instructions, see MEDICAL_AI_SYSTEM_PLAN.md
echo.
pause
