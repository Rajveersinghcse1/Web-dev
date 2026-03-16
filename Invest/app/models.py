"""SQLAlchemy ORM models for College Class Management."""
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from database import Base


class DepartmentEnum(str, enum.Enum):
    CSE = "CSE"
    ECE = "ECE"
    ME = "ME"
    CE = "CE"
    EE = "EE"
    IT = "IT"
    MBA = "MBA"
    BCA = "BCA"


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(15), nullable=True)
    department = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    enrolled_date = Column(Date, nullable=False)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student(id={self.id}, name='{self.name}', dept='{self.department}')>"


class ClassRoom(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_name = Column(String(100), nullable=False)
    subject = Column(String(100), nullable=False)
    teacher = Column(String(100), nullable=False)
    room = Column(String(50), nullable=True)
    schedule = Column(String(100), nullable=True)
    max_capacity = Column(Integer, nullable=False, default=60)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="class_room", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ClassRoom(id={self.id}, name='{self.class_name}', subject='{self.subject}')>"


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    grade = Column(String(5), nullable=True)
    enrollment_date = Column(Date, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="enrollments")
    class_room = relationship("ClassRoom", back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment(student_id={self.student_id}, class_id={self.class_id}, grade='{self.grade}')>"
