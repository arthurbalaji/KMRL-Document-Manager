@echo off
REM KMRL Document Management System - Startup Script for Windows

echo 🚀 Starting KMRL Document Management System...
echo ================================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Please create .env file with your configuration
    echo You can copy from .env.example if available
)

REM Pull latest images
echo 📦 Pulling latest base images...
docker-compose pull postgres pgadmin

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
echo Database: http://localhost:5432
echo AI Service: http://localhost:5000
echo Backend API: http://localhost:8081/api
echo Frontend: http://localhost:3000
echo PgAdmin: http://localhost:8080

echo.
echo ✅ KMRL Document Management System is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8081/api
echo 🤖 AI Service: http://localhost:5000
echo 🗄️  PgAdmin: http://localhost:8080 (admin@kmrl.com / admin123)
echo.
echo 📋 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart
echo.
echo Default login credentials:
echo Username: denis
echo Password: denis
echo.
pause
