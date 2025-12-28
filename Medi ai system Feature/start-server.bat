@echo off
REM Medical Imaging Viewer - Local Server Launcher (Windows)

echo ================================================
echo    Medical Imaging Viewer - Server Launcher
echo ================================================
echo.

set PORT=8000

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
echo.
echo Starting web server on port %PORT%...
echo.
echo Open your browser to: http://localhost:%PORT%
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

python -m http.server %PORT%
