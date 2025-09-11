# KMRL Document Management System - Docker Setup

This document explains how to run the entire KMRL Document Management System using Docker Compose.

## 🏗️ Architecture

The system consists of 4 main services:

1. **PostgreSQL Database** (Port 5432)
2. **AI Service** - Python Flask with Gemini AI (Port 5000)
3. **Backend API** - Spring Boot REST API (Port 8081)
4. **Frontend** - React Web Application (Port 3000)
5. **PgAdmin** - Database Admin Tool (Port 8080) [Optional]

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- 8GB+ RAM recommended
- Internet connection for downloading base images

## 🚀 Quick Start

### Option 1: Using Startup Scripts

**Windows:**
```bash
cd docker
start.bat
```

**Linux/macOS:**
```bash
cd docker
chmod +x start.sh
./start.sh
```

### Option 2: Manual Commands

1. **Clone and navigate to docker directory:**
```bash
cd "d:\Kochi metro document manager\docker"
```

2. **Set up environment variables:**
```bash
# Copy and edit the .env file
cp .env.example .env
# Edit .env file with your Gemini API key
```

3. **Start all services:**
```bash
docker-compose up --build -d
```

4. **Check service status:**
```bash
docker-compose ps
```

## 🔧 Configuration

### Environment Variables (.env file)

Create a `.env` file in the docker directory with:

```env
# Required: Your Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Database (default values, can be changed)
POSTGRES_DB=kmrl_documents
POSTGRES_USER=kmrl_user
POSTGRES_PASSWORD=kmrl_password123

# JWT Configuration
JWT_SECRET=mySecretKey123456789012345678901234567890
JWT_EXPIRATION=86400000

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📱 Access Points

Once all services are running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | `denis` / `denis` |
| **Backend API** | http://localhost:8081/api | N/A |
| **AI Service** | http://localhost:5000 | N/A |
| **Database** | localhost:5432 | `kmrl_user` / `kmrl_password123` |
| **PgAdmin** | http://localhost:8080 | `admin@kmrl.com` / `admin123` |

## 🔍 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild all
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d backend
```

## 🗄️ Database Management

### Using PgAdmin
1. Open http://localhost:8080
2. Login with `admin@kmrl.com` / `admin123`
3. Add server connection:
   - Host: `postgres`
   - Port: `5432`
   - Database: `kmrl_documents`
   - Username: `kmrl_user`
   - Password: `kmrl_password123`

### Direct Database Access
```bash
# Connect to database container
docker-compose exec postgres psql -U kmrl_user -d kmrl_documents

# Run SQL commands
\dt  # List tables
SELECT * FROM users;
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 3000, 5000, 5432, 8080, 8081 are not in use
   - Change ports in docker-compose.yml if needed

2. **Out of Memory**
   - Increase Docker Desktop memory allocation to 8GB+
   - Close unnecessary applications

3. **Build Failures**
   - Run `docker system prune` to clean up
   - Check Docker Desktop has enough disk space

4. **Service Health Checks**
```bash
# Check if all services are healthy
docker-compose ps

# Check specific service logs
docker-compose logs backend
```

### Reset Everything
```bash
# Stop and remove everything
docker-compose down -v
docker system prune -a

# Start fresh
docker-compose up --build -d
```

## 🛠️ Development Mode

For development with hot-reload:

```bash
# Use development override
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

This enables:
- Live code reloading for frontend
- Debug mode for AI service
- Verbose logging for backend

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| Storage | 5GB | 10GB+ |
| CPU | 2 cores | 4+ cores |
| Network | Broadband | Broadband |

## 🎯 Default Users

The system comes with pre-configured users:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `denis` | `denis` | ENGINEER | Test user |
| `admin` | `admin123` | ADMIN | Admin user (if exists) |

## 📞 Support

If you encounter issues:

1. Check service logs: `docker-compose logs -f`
2. Verify all containers are running: `docker-compose ps`
3. Check network connectivity between services
4. Ensure all environment variables are properly set

## 🚀 Production Deployment

For production deployment:

1. Change all default passwords
2. Use proper SSL certificates
3. Set up proper backup strategy
4. Configure monitoring and alerting
5. Use proper secrets management
6. Set up reverse proxy (nginx/traefik)
