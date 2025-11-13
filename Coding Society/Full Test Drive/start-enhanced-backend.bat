@echo off
title Coding Society - Enhanced Backend Server
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 CODING SOCIETY - ENHANCED BACKEND                         ║
echo ╠══════════════════════════════════════════════════════════════════════════════════╣
echo ║  Starting enhanced backend server with Docker integration...                     ║
echo ║  This will connect to your MongoDB, Redis, and MinIO containers                 ║
echo ╚══════════════════════════════════════════════════════════════════════════════════╝
echo.

echo 📂 Navigating to backend directory...
cd /d "%~dp0backend"

echo.
echo 🔍 Checking Docker containers...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr "coding-society" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker containers not running!
    echo Please start your Docker containers first:
    echo   - coding-society-mongodb
    echo   - coding-society-redis  
    echo   - coding-society-minio
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Docker containers detected!
echo.

echo 🔧 Installing/updating dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🌱 Seeding database with sample data...
call npm run seed 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Database seeding skipped (might already have data)
)

echo.
echo 🚀 Starting enhanced backend server...
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                                ║
echo ║  🌟 Server will start on: http://localhost:5000                               ║
echo ║  📚 API Documentation: http://localhost:5000/api-docs                         ║
echo ║  🩺 Health Check: http://localhost:5000/health                                ║
echo ║                                                                                ║
echo ║  💡 Your enhanced HTML console will automatically connect!                    ║
echo ║                                                                                ║
echo ║  ⚠️ Press Ctrl+C to stop the server                                           ║
echo ║                                                                                ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.

call npm start

echo.
echo Server stopped. Press any key to exit...
pause >nul