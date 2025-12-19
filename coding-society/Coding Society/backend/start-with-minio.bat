@echo off
echo ========================================
echo   CODING SOCIETY - ULTRA ADVANCED SETUP
echo ========================================
echo.

echo Starting MinIO and MongoDB with Docker...
docker-compose up -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak

echo.
echo Services Status:
echo MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
echo MinIO API: http://localhost:9000
echo MongoDB: mongodb://localhost:27017/coding-society

echo.
echo Starting Node.js Backend Server...
npm start