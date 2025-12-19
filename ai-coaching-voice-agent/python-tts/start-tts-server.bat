@echo off
echo ============================================
echo   AI Coaching Speech Server v2.0
echo ============================================
echo.
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
pip install -r requirements.txt -q

echo.
echo [INFO] Starting Enhanced Speech Server on http://localhost:5000
echo [INFO] Features: TTS, PDF Export, WebSocket support
echo [INFO] Press Ctrl+C to stop the server
echo.

python speech_server.py
pause
