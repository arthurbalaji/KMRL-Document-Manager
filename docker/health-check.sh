#!/bin/bash

# KMRL Document Management System - Health Check Script

echo "🔍 KMRL System Health Check"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check container status
check_container() {
    local container=$1
    echo -n "Checking container $container... "
    
    if docker-compose ps | grep "$container" | grep -q "Up"; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        return 1
    fi
}

echo "📦 Container Status:"
check_container "kmrl_postgres"
check_container "kmrl_ai_service"
check_container "kmrl_backend"
check_container "kmrl_frontend"
check_container "kmrl_pgadmin"

echo ""
echo "🌐 Service Health:"
check_service "Database" "http://localhost:5432" "000"
check_service "AI Service" "http://localhost:5000/health" "200"
check_service "Backend API" "http://localhost:8081/api/test/health" "200"
check_service "Frontend" "http://localhost:3000" "200"
check_service "PgAdmin" "http://localhost:8080" "200"

echo ""
echo "📊 Resource Usage:"
echo "Docker containers:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -6

echo ""
echo "💾 Volume Usage:"
docker system df

echo ""
echo "🔗 Service URLs:"
echo "Frontend:    http://localhost:3000"
echo "Backend API: http://localhost:8081/api"
echo "AI Service:  http://localhost:5000"
echo "PgAdmin:     http://localhost:8080"

echo ""
echo "📋 Recent Logs (last 10 lines per service):"
echo "Backend:"
docker-compose logs --tail=5 backend | tail -5
echo ""
echo "AI Service:"
docker-compose logs --tail=5 ai-service | tail -5
echo ""
echo "Frontend:"
docker-compose logs --tail=5 frontend | tail -5
