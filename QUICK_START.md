# 🚀 KMRL Document Management System - Complete Docker Setup

## Quick Start Guide

### 1. Prerequisites
- Install Docker Desktop
- Ensure Docker is running
- Have at least 8GB RAM available

### 2. Start the Entire System

**Option A: Windows (Easy)**
```cmd
cd "d:\Kochi metro document manager\docker"
start.bat
```

**Option B: Command Line**
```bash
cd "d:\Kochi metro document manager\docker"
docker-compose up --build -d
```

### 3. Wait for Services (30-60 seconds)

All services will be automatically:
- 🗄️ **Database initialized** with schema and test data
- 🤖 **AI Service started** with Gemini integration
- 🔧 **Backend API running** with authentication
- 📱 **Frontend built** and served
- 🛠️ **PgAdmin ready** for database management

### 4. Access the Application

| Service | URL | Login |
|---------|-----|-------|
| **📱 Main App** | http://localhost:3000 | `denis` / `denis` |
| **🔧 Backend API** | http://localhost:8081/api | - |
| **🤖 AI Service** | http://localhost:5000 | - |
| **🛠️ Database Admin** | http://localhost:8080 | `admin@kmrl.com` / `admin123` |

### 5. System Features

✅ **Authentication** - JWT-based secure login  
✅ **Document Upload** - PDF, images, text files  
✅ **AI Processing** - OCR, content analysis, summaries  
✅ **Bilingual Support** - English and Malayalam  
✅ **Document Chat** - AI-powered document Q&A  
✅ **Semantic Search** - Find documents by content  
✅ **Role-based Access** - Admin, Engineer, Viewer roles  
✅ **Audit Logging** - Complete activity tracking  

### 6. Managing the System

**View Logs:**
```bash
docker-compose logs -f
```

**Stop System:**
```bash
docker-compose down
```

**Restart System:**
```bash
docker-compose restart
```

**Check Health:**
```bash
./health-check.sh    # Linux/Mac
# Or check manually at http://localhost:3000
```

### 7. Test Data

The system comes with:
- Pre-configured database schema
- Test user accounts
- Sample documents (optional)

**Test Login:**
- Username: `denis`
- Password: `denis`
- Role: Engineer

### 8. Troubleshooting

**If services don't start:**
1. Check Docker Desktop is running
2. Ensure ports 3000, 5000, 5432, 8080, 8081 are free
3. Run: `docker-compose down && docker-compose up --build -d`

**If database connection fails:**
1. Wait 60 seconds for database initialization
2. Check logs: `docker-compose logs postgres`

**If frontend shows errors:**
1. Clear browser cache and localStorage
2. Restart frontend: `docker-compose restart frontend`

### 9. Production Notes

For production deployment:
- Change all default passwords in `.env`
- Set up proper SSL certificates
- Configure external database
- Set up monitoring and backups
- Use proper secrets management

### 🎯 That's it! Your complete KMRL Document Management System is now running!

The system includes:
- ✅ PostgreSQL database with full schema
- ✅ Flask AI service with Gemini integration  
- ✅ Spring Boot REST API with JWT auth
- ✅ React frontend with Material-UI
- ✅ Complete document processing pipeline
- ✅ Bilingual AI summaries and chat
- ✅ Semantic search capabilities
- ✅ Role-based access control
- ✅ Audit logging and monitoring
