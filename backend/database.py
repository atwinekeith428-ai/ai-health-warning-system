from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Use environment variable for database URL (production), fall back to SQLite (local)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health.db")

# SQLite needs special handling
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PatientRecord(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    name = Column(String, index=True)
    mother_name = Column(String, nullable=True)
    level = Column(String, index=True)
    date = Column(String)
    vitals = Column(Text, nullable=True)
    risk_factors = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()