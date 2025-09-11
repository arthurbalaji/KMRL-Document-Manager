# KMRL Document Management System

A comprehensive document management system for Kochi Metro Rail Limited (KMRL) with AI-powered analysis, global search capabilities, and role-based access control.

## 🚀 Features

### Core Functionality
- **Document Upload & Processing**: Support for PDF, DOCX, images with OCR
- **AI-Powered Analysis**: Document summarization, tagging, and classification using DeepSeek V2
- **Global Search**: AI-enhanced search across all accessible documents
- **Role-Based Access Control**: Document access based on user roles and sensitivity levels
- **Multi-language Support**: English and Malayalam interface

### AI Capabilities
- **DeepSeek V2 Integration**: Cost-effective AI processing for document analysis
- **Enhanced Fallback Analysis**: Sophisticated heuristic analysis when AI is unavailable
- **Semantic Search**: Intelligent document discovery and relevance matching
- **Document Classification**: Automatic document type detection and sensitivity assessment

### Technical Stack
- **Backend**: Spring Boot (Java)
- **AI Service**: Python Flask with DeepSeek V2 API
- **Database**: PostgreSQL with full-text search
- **Frontend**: React.js with Material-UI
- **Containerization**: Docker with Docker Compose
- **OCR**: Tesseract for text extraction from images

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Spring Boot   │    │   Python Flask  │
│   Frontend      │────│   Backend       │────│   AI Service    │
│   (Port 3000)   │    │   (Port 8080)   │    │   (Port 5000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │              ┌─────────────────┐
                                │              │   DeepSeek V2   │
                                │              │   API Service   │
                                │              └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       │   (Port 5432)   │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd "Kochi metro document manager"
   ```

2. **Start the application**
   ```bash
   cd docker
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - AI Service: http://localhost:5000

### Default Configuration

The project comes with pre-configured environment variables for immediate deployment:

- **DeepSeek API**: Pre-configured (add credits to your DeepSeek account for full AI functionality)
- **Database**: PostgreSQL with default credentials
- **Ports**: Standard ports for all services
  - Automatic tagging and role assignment
  - Sensitivity level detection
- **Role-based access control** (Leadership, HR, Finance, Engineer, Admin)
- **Document chat** - Ask questions about specific documents
- **Global semantic search** - Search across all accessible documents
- **Bilingual UI** with English/Malayalam support
- **Audit logging** and compliance features

## Architecture

```
Frontend (React) ←→ Backend (Spring Boot) ←→ AI Service (Flask)
                          ↓
                    PostgreSQL Database
                          ↓
                    Local File Storage
```

## Quick Start

### 1. Start PostgreSQL Database

```bash
cd docker
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- PgAdmin on port 8080 (admin@kmrl.com / admin123)

### 2. Start AI Service

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 3. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

## Default Users

- **Admin**: admin / admin123
- **Leadership**: leadership / admin123  
- **HR**: hr / admin123
- **Finance**: finance / admin123
- **Engineer**: engineer / admin123

## Configuration

### Environment Variables

Create `.env` files in each service directory:

**AI Service (.env)**:
```
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://kmrl_user:kmrl_password123@localhost:5432/kmrl_documents
```

**Backend (application.properties)**:
```
spring.datasource.url=jdbc:postgresql://localhost:5432/kmrl_documents
spring.datasource.username=kmrl_user
spring.datasource.password=kmrl_password123
```

## API Documentation

Once running, visit:
- Backend API: http://localhost:8081/swagger-ui.html
- AI Service API: http://localhost:5000/docs

## 📁 Project Structure

```
Kochi metro document manager/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/         # Java source code
│   ├── Dockerfile             # Backend container config
│   └── pom.xml               # Maven dependencies
├── ai-service/                # Python Flask AI service
│   ├── app.py                # Main application with DeepSeek V2
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile           # AI service container config
│   └── .env                 # Environment variables (included)
├── frontend/                  # React.js frontend
│   ├── src/                  # React source code
│   ├── public/               # Static assets
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile           # Frontend container config
├── docker/                   # Docker orchestration
│   ├── docker-compose.yml   # Complete multi-container setup
│   ├── .env                 # Environment variables (included)
│   └── init.sql            # Database initialization
└── README.md               # This documentation
```

## 🔧 Configuration (Pre-configured for immediate use)

### DeepSeek V2 Setup
1. **API Key**: Already configured with your key
2. **Add Credits**: Visit https://platform.deepseek.com to add credits
3. **Automatic Fallback**: Enhanced analysis when AI is unavailable

### Default Access
- **Database**: PostgreSQL with preconfigured credentials
- **AI Service**: DeepSeek V2 with intelligent fallback
- **Ports**: 3000 (frontend), 8080 (backend), 5000 (AI), 5432 (database)

## 🚀 Deployment Commands

```bash
# Clone and start everything
git clone <your-repository-url>
cd "Kochi metro document manager"
cd docker
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## 🔍 Features Ready Out-of-the-box

✅ **Complete Docker Setup**: All services containerized  
✅ **DeepSeek V2 Integration**: Cost-effective AI processing  
✅ **Enhanced Fallback**: Works without AI credits  
✅ **Global Search**: AI-powered document discovery  
✅ **Role-based Access**: Automatic permission management  
✅ **Multi-language Support**: English/Malayalam interface  
✅ **Document Processing**: PDF, DOCX, images with OCR  

## 📝 Production Ready

This system is production-ready with:
- **Security**: JWT authentication, role-based access
- **Scalability**: Docker containerization, microservices
- **Reliability**: Enhanced fallback when AI unavailable
- **Monitoring**: Comprehensive logging and error handling

---
**Version**: 1.0.0 | **AI**: DeepSeek V2 | **Status**: Production Ready
