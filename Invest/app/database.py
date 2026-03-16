"""Database configuration and session management."""
import os
import time

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

MYSQL_USER = os.getenv("MYSQL_USER", "college_user")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "college_pass")
MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "college_db")

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def wait_for_db(max_retries: int = 30, delay: int = 2):
    """Wait for the database to be ready."""
    for attempt in range(max_retries):
        try:
            conn = engine.connect()
            conn.close()
            print("✅ Database connection established!")
            return True
        except Exception as e:
            print(f"⏳ Waiting for database... attempt {attempt + 1}/{max_retries}")
            time.sleep(delay)
    raise Exception("❌ Could not connect to the database after max retries.")
