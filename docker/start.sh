#!/bin/bash

# KMRL Document Management System - Startup Script

echo "🚀 Starting KMRL Document Management System..."
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file with your configuration"
fi

# Pull latest images
echo "📦 Pulling latest base images..."
docker-compose pull postgres pgadmin

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
echo "Database: http://localhost:5432"
echo "AI Service: http://localhost:5000"
echo "Backend API: http://localhost:8081/api"
echo "Frontend: http://localhost:3000"
echo "PgAdmin: http://localhost:8080"

# Test database connection
echo "🔧 Testing database connection..."
docker-compose exec postgres pg_isready -U kmrl_user -d kmrl_documents

echo ""
echo "✅ KMRL Document Management System is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8081/api"
echo "🤖 AI Service: http://localhost:5000"
echo "🗄️  PgAdmin: http://localhost:8080 (admin@kmrl.com / admin123)"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""
echo "Default login credentials:"
echo "Username: denis"
echo "Password: denis"
