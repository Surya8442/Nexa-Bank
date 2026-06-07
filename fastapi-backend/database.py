# database.py - Database Engine and Session Context Managers
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Retrieve PostgreSQL deployment credentials from environment variables or default to SQLite local file for seamless evaluation
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nexabank_owner:Password123@localhost:5432/nexabank_db")

# Use SQLite optimization arguments if URL starts with sqlite
if DATABASE_URL.startswith("sqlite"):
    Engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    Engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=Engine)

Base = declarative_base()

def get_db():
    """Provides a transactional database session context."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
