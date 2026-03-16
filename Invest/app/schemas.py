"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date


# ─── Student Schemas ───────────────────────────────────────────

class StudentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Rajveer Singh")
    email: str = Field(..., max_length=150, example="rajveer@college.edu")
    phone: Optional[str] = Field(None, max_length=15, example="9876543210")
    department: str = Field(..., max_length=50, example="CSE")
    year: int = Field(..., ge=1, le=5, example=2)
    enrolled_date: date = Field(..., example="2025-08-01")


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=15)
    department: Optional[str] = Field(None, max_length=50)
    year: Optional[int] = Field(None, ge=1, le=5)
    enrolled_date: Optional[date] = None


class StudentResponse(StudentBase):
    id: int

    class Config:
        from_attributes = True


# ─── Class Schemas ─────────────────────────────────────────────

class ClassBase(BaseModel):
    class_name: str = Field(..., min_length=1, max_length=100, example="CS-101")
    subject: str = Field(..., max_length=100, example="Data Structures")
    teacher: str = Field(..., max_length=100, example="Dr. Sharma")
    room: Optional[str] = Field(None, max_length=50, example="Room 201")
    schedule: Optional[str] = Field(None, max_length=100, example="Mon/Wed 10:00-11:30")
    max_capacity: int = Field(60, ge=1, example=60)


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    class_name: Optional[str] = Field(None, min_length=1, max_length=100)
    subject: Optional[str] = Field(None, max_length=100)
    teacher: Optional[str] = Field(None, max_length=100)
    room: Optional[str] = Field(None, max_length=50)
    schedule: Optional[str] = Field(None, max_length=100)
    max_capacity: Optional[int] = Field(None, ge=1)


class ClassResponse(ClassBase):
    id: int

    class Config:
        from_attributes = True


# ─── Enrollment Schemas ───────────────────────────────────────

class EnrollmentBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    grade: Optional[str] = Field(None, max_length=5, example="A+")
    enrollment_date: date = Field(..., example="2025-08-15")


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentUpdate(BaseModel):
    grade: Optional[str] = Field(None, max_length=5)
    enrollment_date: Optional[date] = None


class EnrollmentResponse(EnrollmentBase):
    id: int
    student_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Stats Schema ─────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_students: int
    total_classes: int
    total_enrollments: int
    departments: List[str]
