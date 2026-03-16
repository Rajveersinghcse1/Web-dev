"""
College Class Management System — FastAPI Application
=====================================================
Full CRUD REST API for managing Students, Classes, and Enrollments.
"""
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from contextlib import asynccontextmanager

from database import get_db, wait_for_db, engine, Base
from models import Student, ClassRoom, Enrollment
from schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    ClassCreate, ClassUpdate, ClassResponse,
    EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse,
    StatsResponse,
)
import crud


# ─── Lifespan ──────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: wait for DB and create tables."""
    wait_for_db()
    Base.metadata.create_all(bind=engine)
    print("🎓 College Class Management API is ready!")
    yield


# ─── App ───────────────────────────────────────────────────────

app = FastAPI(
    title="🎓 College Class Management API",
    description=(
        "A full CRUD REST API for managing college students, classes, "
        "and enrollments. Built with FastAPI + MySQL + Docker."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════
#  HEALTH & STATS
# ═══════════════════════════════════════════════════════════════

@app.get("/health", tags=["Utility"])
def health_check():
    return {"status": "healthy", "service": "College Class Management API"}


@app.get("/stats", response_model=StatsResponse, tags=["Utility"])
def get_stats(db: Session = Depends(get_db)):
    """Get summary statistics of the system."""
    return crud.get_stats(db)


# ═══════════════════════════════════════════════════════════════
#  STUDENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/students", response_model=List[StudentResponse], tags=["Students"])
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    department: Optional[str] = Query(None, description="Filter by department"),
    year: Optional[int] = Query(None, ge=1, le=5, description="Filter by year"),
    search: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db),
):
    """List all students with optional filters."""
    return crud.get_students(db, skip=skip, limit=limit, department=department, year=year, search=search)


@app.get("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID."""
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with id {student_id} not found")
    return student


@app.post("/students", response_model=StudentResponse, status_code=201, tags=["Students"])
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Add a new student."""
    existing = crud.get_student_by_email(db, student.email)
    if existing:
        raise HTTPException(status_code=400, detail=f"Email '{student.email}' is already registered")
    return crud.create_student(db, student)


@app.put("/students/{student_id}", response_model=StudentResponse, tags=["Students"])
def update_student(student_id: int, student: StudentUpdate, db: Session = Depends(get_db)):
    """Update an existing student's details."""
    updated = crud.update_student(db, student_id, student)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Student with id {student_id} not found")
    return updated


@app.delete("/students/{student_id}", tags=["Students"])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student (and their enrollments)."""
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Student with id {student_id} not found")
    return {"message": f"Student {student_id} deleted successfully"}


# ═══════════════════════════════════════════════════════════════
#  CLASS ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/classes", response_model=List[ClassResponse], tags=["Classes"])
def list_classes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List all classes."""
    return crud.get_classes(db, skip=skip, limit=limit)


@app.get("/classes/{class_id}", response_model=ClassResponse, tags=["Classes"])
def get_class(class_id: int, db: Session = Depends(get_db)):
    """Get a specific class by ID."""
    cls = crud.get_class(db, class_id)
    if not cls:
        raise HTTPException(status_code=404, detail=f"Class with id {class_id} not found")
    return cls


@app.post("/classes", response_model=ClassResponse, status_code=201, tags=["Classes"])
def create_class(class_data: ClassCreate, db: Session = Depends(get_db)):
    """Create a new class."""
    return crud.create_class(db, class_data)


@app.put("/classes/{class_id}", response_model=ClassResponse, tags=["Classes"])
def update_class(class_id: int, class_data: ClassUpdate, db: Session = Depends(get_db)):
    """Update an existing class."""
    updated = crud.update_class(db, class_id, class_data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Class with id {class_id} not found")
    return updated


@app.delete("/classes/{class_id}", tags=["Classes"])
def delete_class(class_id: int, db: Session = Depends(get_db)):
    """Delete a class (and its enrollments)."""
    success = crud.delete_class(db, class_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Class with id {class_id} not found")
    return {"message": f"Class {class_id} deleted successfully"}


# ═══════════════════════════════════════════════════════════════
#  ENROLLMENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.get("/enrollments", response_model=List[EnrollmentResponse], tags=["Enrollments"])
def list_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    student_id: Optional[int] = Query(None, description="Filter by student ID"),
    class_id: Optional[int] = Query(None, description="Filter by class ID"),
    db: Session = Depends(get_db),
):
    """List enrollments with optional filters."""
    enrollments = crud.get_enrollments(db, skip=skip, limit=limit, student_id=student_id, class_id=class_id)
    # Enrich with names
    result = []
    for e in enrollments:
        resp = EnrollmentResponse(
            id=e.id,
            student_id=e.student_id,
            class_id=e.class_id,
            grade=e.grade,
            enrollment_date=e.enrollment_date,
            student_name=e.student.name if e.student else None,
            class_name=e.class_room.class_name if e.class_room else None,
        )
        result.append(resp)
    return result


@app.post("/enrollments", response_model=EnrollmentResponse, status_code=201, tags=["Enrollments"])
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    """Enroll a student in a class."""
    # Validate student exists
    student = crud.get_student(db, enrollment.student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {enrollment.student_id} not found")
    # Validate class exists
    cls = crud.get_class(db, enrollment.class_id)
    if not cls:
        raise HTTPException(status_code=404, detail=f"Class {enrollment.class_id} not found")
    e = crud.create_enrollment(db, enrollment)
    return EnrollmentResponse(
        id=e.id,
        student_id=e.student_id,
        class_id=e.class_id,
        grade=e.grade,
        enrollment_date=e.enrollment_date,
        student_name=student.name,
        class_name=cls.class_name,
    )


@app.put("/enrollments/{enrollment_id}", response_model=EnrollmentResponse, tags=["Enrollments"])
def update_enrollment(enrollment_id: int, enrollment: EnrollmentUpdate, db: Session = Depends(get_db)):
    """Update an enrollment (e.g., assign a grade)."""
    updated = crud.update_enrollment(db, enrollment_id, enrollment)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Enrollment {enrollment_id} not found")
    return EnrollmentResponse(
        id=updated.id,
        student_id=updated.student_id,
        class_id=updated.class_id,
        grade=updated.grade,
        enrollment_date=updated.enrollment_date,
        student_name=updated.student.name if updated.student else None,
        class_name=updated.class_room.class_name if updated.class_room else None,
    )


@app.delete("/enrollments/{enrollment_id}", tags=["Enrollments"])
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    """Remove an enrollment."""
    success = crud.delete_enrollment(db, enrollment_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Enrollment {enrollment_id} not found")
    return {"message": f"Enrollment {enrollment_id} deleted successfully"}
