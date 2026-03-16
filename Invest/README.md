# 🎓 College Class Management System

A full-stack **College Class Management** system built with **Docker Compose**, featuring FastAPI, MySQL, and Grafana.

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Grafana    │◄─────│   FastAPI    │─────►│    MySQL     │
│  :3000       │      │   :8000      │      │   :3306      │
│  dashboards  │      │  REST API    │      │  college_db  │
└──────────────┘      └──────────────┘      └──────────────┘
```

| Service   | URL                      | Description               |
|-----------|--------------------------|---------------------------|
| FastAPI   | http://localhost:8000     | REST API + Swagger Docs   |
| Swagger   | http://localhost:8000/docs| Interactive API Docs      |
| Grafana   | http://localhost:3000     | Analytics Dashboard       |
| MySQL     | localhost:3306            | Database                  |

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Run the Project

```bash
# Clone the repository
git clone <repo-url>
cd Invest

# Start all services
docker-compose up --build

# Or run in the background
docker-compose up --build -d
```

### Stop the Project

```bash
docker-compose down

# Stop and remove all data
docker-compose down -v
```

## 📡 API Endpoints

### Students
| Method   | Endpoint           | Description                     |
|----------|--------------------|---------------------------------|
| `GET`    | `/students`        | List all students (filter/search)|
| `GET`    | `/students/{id}`   | Get student by ID               |
| `POST`   | `/students`        | Add new student                 |
| `PUT`    | `/students/{id}`   | Update student details          |
| `DELETE` | `/students/{id}`   | Delete a student                |

### Classes
| Method   | Endpoint          | Description           |
|----------|-------------------|-----------------------|
| `GET`    | `/classes`        | List all classes      |
| `GET`    | `/classes/{id}`   | Get class by ID       |
| `POST`   | `/classes`        | Create new class      |
| `PUT`    | `/classes/{id}`   | Update class details  |
| `DELETE` | `/classes/{id}`   | Delete a class        |

### Enrollments
| Method   | Endpoint              | Description                   |
|----------|-----------------------|-------------------------------|
| `GET`    | `/enrollments`        | List all enrollments          |
| `POST`   | `/enrollments`        | Enroll student in a class     |
| `PUT`    | `/enrollments/{id}`   | Update enrollment (grade etc.)|
| `DELETE` | `/enrollments/{id}`   | Remove enrollment             |

### Utility
| Method | Endpoint  | Description      |
|--------|-----------|------------------|
| `GET`  | `/health` | Health check     |
| `GET`  | `/stats`  | Summary stats    |

## 📊 Grafana Dashboard

Access Grafana at **http://localhost:3000** (login: `admin` / `admin`).

The pre-built dashboard includes:
- **Total Students / Classes / Enrollments** — stat panels
- **Students by Department** — pie chart
- **Students by Year** — bar chart
- **Class Enrollment vs Capacity** — bar chart
- **Grade Distribution** — donut chart
- **All Students Table** — detailed list
- **Enrollment Details Table** — student-class-grade view

## 🛠️ Tech Stack

| Technology | Role               |
|------------|--------------------|
| FastAPI    | REST API framework |
| MySQL 8.0  | Relational database|
| Grafana    | Dashboard & analytics |
| SQLAlchemy | ORM                |
| Docker     | Containerization   |
| Pydantic   | Data validation    |

## 📁 Project Structure

```
Invest/
├── app/
│   ├── main.py          # FastAPI app & routes
│   ├── database.py      # DB config & session
│   ├── models.py        # ORM models
│   ├── schemas.py       # Pydantic schemas
│   └── crud.py          # CRUD operations
├── mysql/
│   └── init.sql         # Schema + seed data
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasource.yml
│   │   └── dashboards/
│   │       └── dashboard.yml
│   └── dashboards/
│       └── college_dashboard.json
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── .env
└── README.md
```

## 📝 Example API Usage

### Add a Student
```bash
curl -X POST http://localhost:8000/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@college.edu",
    "phone": "1234567890",
    "department": "CSE",
    "year": 1,
    "enrolled_date": "2025-08-01"
  }'
```

### Enroll in a Class
```bash
curl -X POST http://localhost:8000/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "class_id": 1,
    "enrollment_date": "2025-08-15"
  }'
```

### Update a Grade
```bash
curl -X PUT http://localhost:8000/enrollments/1 \
  -H "Content-Type: application/json" \
  -d '{"grade": "A+"}'
```

### Search Students by Department
```bash
curl http://localhost:8000/students?department=CSE
```
