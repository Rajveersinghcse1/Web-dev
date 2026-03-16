"""CRUD operations for Students, Classes, and Enrollments."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List

from models import Student, ClassRoom, Enrollment
from schemas import (
    StudentCreate, StudentUpdate,
    ClassCreate, ClassUpdate,
    EnrollmentCreate, EnrollmentUpdate,
)


# ═══════════════════════════════════════════════════════════════
#  STUDENT CRUD
# ═══════════════════════════════════════════════════════════════

def get_students(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
) -> List[Student]:
    """List students with optional filters."""
    query = db.query(Student)
    if department:
        query = query.filter(Student.department == department)
    if year:
        query = query.filter(Student.year == year)
    if search:
        query = query.filter(Student.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


def get_student(db: Session, student_id: int) -> Optional[Student]:
    return db.query(Student).filter(Student.id == student_id).first()


def get_student_by_email(db: Session, email: str) -> Optional[Student]:
    return db.query(Student).filter(Student.email == email).first()


def create_student(db: Session, student: StudentCreate) -> Student:
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def update_student(db: Session, student_id: int, student: StudentUpdate) -> Optional[Student]:
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        return None
    update_data = student.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    db.commit()
    db.refresh(db_student)
    return db_student


def delete_student(db: Session, student_id: int) -> bool:
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
#  CLASS CRUD
# ═══════════════════════════════════════════════════════════════

def get_classes(db: Session, skip: int = 0, limit: int = 100) -> List[ClassRoom]:
    return db.query(ClassRoom).offset(skip).limit(limit).all()


def get_class(db: Session, class_id: int) -> Optional[ClassRoom]:
    return db.query(ClassRoom).filter(ClassRoom.id == class_id).first()


def create_class(db: Session, class_data: ClassCreate) -> ClassRoom:
    db_class = ClassRoom(**class_data.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


def update_class(db: Session, class_id: int, class_data: ClassUpdate) -> Optional[ClassRoom]:
    db_class = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    if not db_class:
        return None
    update_data = class_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    db.commit()
    db.refresh(db_class)
    return db_class


def delete_class(db: Session, class_id: int) -> bool:
    db_class = db.query(ClassRoom).filter(ClassRoom.id == class_id).first()
    if not db_class:
        return False
    db.delete(db_class)
    db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
#  ENROLLMENT CRUD
# ═══════════════════════════════════════════════════════════════

def get_enrollments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
) -> List[Enrollment]:
    query = db.query(Enrollment)
    if student_id:
        query = query.filter(Enrollment.student_id == student_id)
    if class_id:
        query = query.filter(Enrollment.class_id == class_id)
    return query.offset(skip).limit(limit).all()


def get_enrollment(db: Session, enrollment_id: int) -> Optional[Enrollment]:
    return db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()


def create_enrollment(db: Session, enrollment: EnrollmentCreate) -> Enrollment:
    db_enrollment = Enrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


def update_enrollment(db: Session, enrollment_id: int, enrollment: EnrollmentUpdate) -> Optional[Enrollment]:
    db_enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not db_enrollment:
        return None
    update_data = enrollment.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_enrollment, key, value)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment


def delete_enrollment(db: Session, enrollment_id: int) -> bool:
    db_enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not db_enrollment:
        return False
    db.delete(db_enrollment)
    db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
#  STATS
# ═══════════════════════════════════════════════════════════════

def get_stats(db: Session) -> dict:
    total_students = db.query(func.count(Student.id)).scalar()
    total_classes = db.query(func.count(ClassRoom.id)).scalar()
    total_enrollments = db.query(func.count(Enrollment.id)).scalar()
    departments = [
        row[0] for row in db.query(Student.department).distinct().all()
    ]
    return {
        "total_students": total_students,
        "total_classes": total_classes,
        "total_enrollments": total_enrollments,
        "departments": departments,
    }
