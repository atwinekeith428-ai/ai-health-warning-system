from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PatientRecord(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=True, index=True)  # e.g. M-001, N-002
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


def generate_patient_id(db, record_type):
    """Generate a patient ID like M-001, M-002, N-001, N-002."""
    prefix = "M" if record_type == "Maternal" else "N"
    # Count existing records of this type
    count = db.query(PatientRecord).filter(PatientRecord.type == record_type).count()
    next_num = count + 1
    # Loop in case an ID already exists (safety)
    while True:
        candidate = f"{prefix}-{next_num:03d}"
        exists = db.query(PatientRecord).filter(PatientRecord.patient_id == candidate).first()
        if not exists:
            return candidate
        next_num += 1


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()