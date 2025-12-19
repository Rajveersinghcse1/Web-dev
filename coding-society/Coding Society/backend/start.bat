@echo off
echo ========================================
echo  Coding Society Backend Quick Start
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo.
    echo IMPORTANT: Please edit .env file with your MongoDB connection details!
    echo Press any key when you've configured .env...
    pause
    echo.
)

REM Check MongoDB connection
echo Checking if MongoDB is accessible...
echo This may take a moment...
timeout /t 3 /nobreak >nul

REM Ask user if they want to seed database
echo.
set /p SEED_DB="Do you want to seed the database with sample data? (y/n): "
if /i "%SEED_DB%"=="y" (
    echo.
    echo Seeding database...
    npm run seed
    echo.
)

REM Start the development server
echo Starting development server...
echo Server will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause