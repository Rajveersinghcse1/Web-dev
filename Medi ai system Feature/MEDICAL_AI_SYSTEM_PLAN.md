# Medical AI Agent Coordination System - Implementation Plan

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (HTML/CSS/JS)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DICOM Viewer │  │ Job Dashboard│  │ Results Panel│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│             WebSocket ↕ REST API                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│         ORCHESTRATOR (FastAPI + Celery + Redis)            │
│  ┌────────────────────────────────────────────────┐        │
│  │  Job Queue → Sequential Agent Chain Execution  │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
         ↓            ↓            ↓            ↓
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ History      │ │ Image    │ │ Drug     │ │ Research │
│ Agent        │ │ Agent    │ │ Agent    │ │ Agent    │
│ (FHIR/NLP)   │ │ (MONAI)  │ │ (DrugDB) │ │ (PubMed) │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

## 📁 Project Structure

```
medical-ai-system/
├── backend/
│   ├── orchestrator/          # Main FastAPI app + Celery
│   │   ├── app.py            # FastAPI application
│   │   ├── celery_app.py     # Celery configuration
│   │   ├── workflows.py      # Agent coordination workflows
│   │   ├── models.py         # Database models
│   │   ├── websocket.py      # Real-time notifications
│   │   └── config.py         # Configuration
│   │
│   ├── agents/
│   │   ├── image_agent/      # MONAI-based image analysis
│   │   │   ├── app.py       # Flask/FastAPI server
│   │   │   ├── inference.py # Model inference
│   │   │   ├── gradcam.py   # Heatmap generation
│   │   │   └── models/      # Pretrained weights
│   │   │
│   │   ├── history_agent/    # FHIR + Clinical summary
│   │   │   ├── app.py
│   │   │   ├── fhir_client.py
│   │   │   └── synthesizer.py
│   │   │
│   │   ├── drug_agent/       # Drug interaction checker
│   │   │   ├── app.py
│   │   │   ├── drug_db.py
│   │   │   └── data/         # DrugBank data
│   │   │
│   │   └── research_agent/   # Evidence-based search
│   │       ├── app.py
│   │       ├── literature_db.py
│   │       └── data/         # Curated literature
│   │
│   ├── storage/              # MinIO/S3 interface
│   │   └── minio_client.py
│   │
│   ├── database/             # PostgreSQL models
│   │   └── models.py
│   │
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── index.html           # Main dashboard
│   ├── viewer.html          # Integrated DICOM viewer
│   ├── css/
│   │   ├── dashboard.css
│   │   └── medical-viewer.css
│   ├── js/
│   │   ├── api-client.js    # Backend API calls
│   │   ├── websocket-handler.js
│   │   ├── job-manager.js
│   │   ├── results-renderer.js
│   │   └── dicom-viewer-integration.js
│   └── assets/
│
├── docker/
│   ├── docker-compose.yml   # Full stack orchestration
│   ├── Dockerfile.orchestrator
│   ├── Dockerfile.image_agent
│   └── Dockerfile.agents
│
├── data/                     # Sample data
│   ├── dicom_samples/
│   ├── fhir_test_data/
│   └── drug_database/
│
├── tests/
│   ├── test_agents.py
│   └── test_workflows.py
│
├── docs/
│   ├── API.md               # API documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── AGENT_SPECS.md       # Agent specifications
│
├── venv/                     # Python virtual environment
├── setup.sh                  # Setup script
└── README.md
```

## 🔧 Technology Stack

### Backend
- **Orchestrator**: FastAPI, Celery, Redis, PostgreSQL
- **Image Agent**: MONAI, PyTorch, OpenCV, Grad-CAM
- **History Agent**: FHIR Client (fhirclient), spaCy (optional NLP)
- **Drug Agent**: SQLite/JSON, DrugBank data
- **Research Agent**: Elasticsearch (optional), JSON database
- **Storage**: MinIO (S3-compatible) or local filesystem

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: WebSocket API
- **Visualization**: Canvas API, Chart.js
- **DICOM**: Existing viewer from previous work

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Message Queue**: Redis
- **Database**: PostgreSQL
- **Object Storage**: MinIO (local S3)

## 📋 Implementation Phases

### Phase 1: Foundation (Tasks 1-2)
✅ **Deliverables**:
- Project folder structure created
- Python venv with all dependencies
- Configuration files
- Documentation skeleton

### Phase 2: Core Backend (Task 3)
✅ **Deliverables**:
- FastAPI application with REST endpoints
- Celery task queue configuration
- Job creation and management APIs
- Database models for jobs, results, audit logs
- Basic workflow coordination

### Phase 3: Agent Development (Tasks 4-7)
✅ **Deliverables**:
- **Image Agent**: MONAI inference, Grad-CAM, S3 integration
- **History Agent**: FHIR client, clinical summary generator
- **Drug Agent**: Interaction checker, severity calculator
- **Research Agent**: Literature query, citation ranking

### Phase 4: Frontend (Task 8)
✅ **Deliverables**:
- Job submission dashboard
- Real-time progress tracking UI
- Results visualization panel
- Integration with existing DICOM viewer
- Heatmap overlay display

### Phase 5: Real-time & Integration (Task 9)
✅ **Deliverables**:
- WebSocket server for live updates
- Push notifications for clinicians
- Agent status monitoring
- Error handling and retry logic

### Phase 6: Deployment (Task 10)
✅ **Deliverables**:
- Docker Compose orchestration
- Test data and mock FHIR server
- API documentation (Swagger)
- Setup and startup scripts
- Testing suite

## 🔐 Safety & Compliance Notes

### Critical Safety Rules
1. **Drug Agent**: ADVISORY ONLY - requires explicit clinician acknowledgment
2. **Audit Logging**: All agent actions logged immutably
3. **PHI Protection**: HIPAA-compliant data handling
4. **Model Versioning**: Track model versions in all outputs
5. **Human-in-the-Loop**: No automated clinical actions

### Data Privacy
- Patient data anonymization
- Secure storage (encryption at rest)
- Access control and authentication
- Audit trail for all data access

## 📊 Performance Targets

| Component | Latency Target | Notes |
|-----------|---------------|-------|
| Image Agent (XR) | < 2 seconds | CPU: ~5-10s, GPU: < 2s |
| Image Agent (CT) | < 5 seconds | CPU: ~15-20s, GPU: < 5s |
| History Agent | < 1 second | FHIR query + synthesis |
| Drug Agent | < 500ms | Local DB lookup |
| Research Agent | < 2 seconds | Elasticsearch query |
| Total Pipeline | < 10 seconds | Sequential execution |

## 🚀 Quick Start Commands

### Setup Virtual Environment
```bash
cd medical-ai-system
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r backend/requirements.txt
```

### Start Services (Development)
```bash
# Terminal 1: Redis
docker run -d -p 6379:6379 redis:alpine

# Terminal 2: PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14

# Terminal 3: MinIO (Optional)
docker run -d -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"

# Terminal 4: Celery Worker
cd backend/orchestrator
celery -A celery_app worker --loglevel=info

# Terminal 5: FastAPI Orchestrator
cd backend/orchestrator
uvicorn app:app --reload --port 8000

# Terminal 6: Image Agent
cd backend/agents/image_agent
python app.py

# Terminal 7: History Agent
cd backend/agents/history_agent
python app.py

# Terminal 8: Drug Agent
cd backend/agents/drug_agent
python app.py

# Terminal 9: Research Agent
cd backend/agents/research_agent
python app.py
```

### Start Frontend
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

## 🧪 Testing

### Test Data
- Sample DICOM files (chest X-rays, CT scans)
- Mock FHIR patient records
- Drug interaction test cases
- Curated literature database

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Create analysis job
curl -X POST http://localhost:8000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "12345", "dicom_uri": "s3://images/xray.dcm"}'

# Get job status
curl http://localhost:8000/api/v1/jobs/{job_id}
```

## 📖 API Endpoints

### Orchestrator API
- `POST /api/v1/jobs` - Create new analysis job
- `GET /api/v1/jobs/{job_id}` - Get job status
- `GET /api/v1/jobs/{job_id}/results` - Get final results
- `WS /ws/jobs/{job_id}` - Real-time updates

### Agent APIs
- `POST /predict` (Image Agent)
- `POST /synthesize` (History Agent)
- `POST /check` (Drug Agent)
- `POST /query` (Research Agent)

## 🎯 Next Steps

1. **Execute setup script** to create folder structure
2. **Create venv** and install dependencies
3. **Implement orchestrator** with basic workflow
4. **Build agents** one by one with mock data
5. **Create frontend** dashboard
6. **Integrate** all components
7. **Test** end-to-end workflow
8. **Deploy** with Docker Compose

---

**Status**: Ready to begin implementation
**Estimated Time**: 3-4 hours for MVP
**Priority**: Core workflow first, then agent sophistication
