from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import json

from database import init_db, get_db, PatientRecord, generate_patient_id

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

model = joblib.load('maternal_risk_model.pkl')
label_encoder = joblib.load('label_encoder.pkl')


class MaternalData(BaseModel):
    age: int
    systolic_bp: int
    diastolic_bp: int
    bs: float
    body_temp: float
    heart_rate: int


class MaternalRecordCreate(BaseModel):
    patient_name: str
    age: int
    systolic_bp: int
    diastolic_bp: int
    bs: float
    body_temp: float
    heart_rate: int


class NewbornRecordCreate(BaseModel):
    baby_name: str
    mother_name: str = ""
    birth_weight: float
    temperature: float
    respiratory_rate: int
    oxygen_saturation: int
    feeding: str


class RecordUpdate(BaseModel):
    name: str = None
    level: str = None
    notes: str = None


def serialize(r):
    return {
        "id": r.id,
        "patient_id": r.patient_id,
        "type": r.type,
        "name": r.name,
        "mother_name": r.mother_name,
        "level": r.level,
        "date": r.date,
        "vitals": json.loads(r.vitals) if r.vitals else {},
        "risk_factors": json.loads(r.risk_factors) if r.risk_factors else [],
        "recommended_action": r.recommended_action,
        "notes": r.notes,
    }


def analyze_maternal(data):
    input_data = pd.DataFrame([[
        data.age, data.systolic_bp, data.diastolic_bp,
        data.bs, data.body_temp, data.heart_rate
    ]], columns=['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate'])

    prediction_encoded = model.predict(input_data)[0]
    risk_level = label_encoder.inverse_transform([prediction_encoded])[0]

    body_temp_c = (data.body_temp - 32) * 5 / 9

    risk_factors = []

    # --- Blood pressure ---
    if data.systolic_bp >= 140 or data.diastolic_bp >= 90:
        risk_factors.append(f"High blood pressure ({data.systolic_bp}/{data.diastolic_bp} mmHg)")
    if data.systolic_bp < 90 or data.diastolic_bp < 60:
        risk_factors.append(f"Low blood pressure ({data.systolic_bp}/{data.diastolic_bp} mmHg)")

    # --- Body temperature ---
    if body_temp_c >= 38.0:
        risk_factors.append(f"High fever ({body_temp_c:.1f}°C)")
    elif body_temp_c >= 37.6:
        risk_factors.append(f"Low-grade fever ({body_temp_c:.1f}°C)")
    elif body_temp_c < 36.0:
        risk_factors.append(f"Hypothermia - dangerously low temperature ({body_temp_c:.1f}°C)")

    # --- Heart rate ---
    if data.heart_rate > 100:
        risk_factors.append(f"Increased pulse rate ({data.heart_rate} bpm)")
    if data.heart_rate < 60:
        risk_factors.append(f"Low pulse rate - bradycardia ({data.heart_rate} bpm)")

    # --- Blood sugar ---
    if data.bs > 11:
        risk_factors.append(f"High blood sugar ({data.bs} mmol/L)")
    if data.bs < 4:
        risk_factors.append(f"Low blood sugar - hypoglycemia ({data.bs} mmol/L)")

    # --- Age assessment (UPDATED THRESHOLDS) ---
    # < 17        → HIGH (child/teen pregnancy)
    # 18 - 40     → LOW (normal)
    # 41 - 49     → MODERATE (advanced maternal age)
    # >= 50       → HIGH (very advanced maternal age)
    age_risk = "Low"
    if data.age < 17:
        risk_factors.append(f"CRITICAL - Very young maternal age ({data.age} years) - child pregnancy")
        age_risk = "High"
    elif data.age == 17:
        risk_factors.append(f"Young maternal age ({data.age} years)")
        age_risk = "High"
    elif data.age >= 50:
        risk_factors.append(f"CRITICAL - Very advanced maternal age ({data.age} years)")
        age_risk = "High"
    elif data.age >= 41:
        risk_factors.append(f"Advanced maternal age ({data.age} years)")
        age_risk = "Moderate"

    # --- Critical vitals override (includes extreme age) ---
    critical = (
        body_temp_c < 35.0 or body_temp_c >= 39.0 or
        data.systolic_bp >= 160 or data.systolic_bp < 80 or
        data.heart_rate >= 120 or data.heart_rate < 50 or
        data.bs >= 15 or data.bs < 3 or
        data.age < 17 or data.age >= 50
    )

    if critical:
        risk_level = "High Risk"
        action = "CRITICAL: Seek immediate medical attention. Vitals or age indicate a life-threatening condition."
    elif age_risk == "High" or "high" in risk_level.lower():
        risk_level = "High Risk"
        action = "Please consider further clinical evaluation and close monitoring. Refer to a healthcare professional immediately."
    elif age_risk == "Moderate" or "mid" in risk_level.lower():
        risk_level = "Mid Risk"
        action = "Monitor closely and follow up at the next visit."
    else:
        action = "Continue routine monitoring. No immediate action required."

    return risk_level, risk_factors, action, body_temp_c


def analyze_newborn(data):
    """Rule-based newborn risk assessment with proper weight thresholds."""
    factors = []

    # === BIRTH WEIGHT (in kg) ===
    weight_risk = "Low"
    if data.birth_weight < 2.0:
        factors.append(f"Very low birth weight ({data.birth_weight} kg) - severe risk")
        weight_risk = "High"
    elif data.birth_weight < 2.5:
        factors.append(f"Low birth weight ({data.birth_weight} kg)")
        weight_risk = "Moderate"
    elif data.birth_weight >= 7.0:
        factors.append(f"Extremely high birth weight ({data.birth_weight} kg) - requires investigation")
        weight_risk = "High"
    elif data.birth_weight > 4.0:
        factors.append(f"High birth weight - macrosomia ({data.birth_weight} kg)")
        weight_risk = "Moderate"

    # === TEMPERATURE (Celsius) ===
    temp_risk = "Low"
    if data.temperature < 35.5:
        factors.append(f"Severe hypothermia ({data.temperature}°C)")
        temp_risk = "High"
    elif data.temperature < 36.5:
        factors.append(f"Low temperature - hypothermia ({data.temperature}°C)")
        temp_risk = "Moderate"
    elif data.temperature >= 38.0:
        factors.append(f"High fever ({data.temperature}°C)")
        temp_risk = "High"
    elif data.temperature >= 37.5:
        factors.append(f"Elevated temperature ({data.temperature}°C)")
        temp_risk = "Moderate"

    # === RESPIRATORY RATE ===
    resp_risk = "Low"
    if data.respiratory_rate > 80:
        factors.append(f"Severe tachypnea ({data.respiratory_rate} breaths/min)")
        resp_risk = "High"
    elif data.respiratory_rate > 60:
        factors.append(f"Increased respiratory rate ({data.respiratory_rate} breaths/min)")
        resp_risk = "Moderate"
    elif data.respiratory_rate < 25:
        factors.append(f"Low respiratory rate ({data.respiratory_rate} breaths/min)")
        resp_risk = "High"
    elif data.respiratory_rate < 30:
        factors.append(f"Decreased respiratory rate ({data.respiratory_rate} breaths/min)")
        resp_risk = "Moderate"

    # === OXYGEN SATURATION ===
    o2_risk = "Low"
    if data.oxygen_saturation < 85:
        factors.append(f"CRITICAL oxygen saturation ({data.oxygen_saturation}%)")
        o2_risk = "High"
    elif data.oxygen_saturation < 90:
        factors.append(f"Low oxygen saturation ({data.oxygen_saturation}%)")
        o2_risk = "Moderate"

    # === FEEDING ===
    feed_risk = "Low"
    if data.feeding == "Poor feeding":
        factors.append("Poor feeding observation")
        feed_risk = "Moderate"

    # === OVERALL RISK ===
    if "High" in [weight_risk, temp_risk, resp_risk, o2_risk]:
        level = "High"
    elif "Moderate" in [weight_risk, temp_risk, resp_risk, o2_risk, feed_risk]:
        level = "Moderate"
    else:
        level = "Low"

    if level == "High":
        action = "CRITICAL: Immediate neonatal evaluation required. Consult a neonatologist urgently."
    elif level == "Moderate":
        action = "Monitor closely, provide supportive care, and consult a neonatologist."
    else:
        action = "Routine newborn care. No major risk factors detected."

    return level, factors, action


@app.post("/api/predict/maternal")
def predict_maternal(data: MaternalData):
    risk_level, risk_factors, action, body_temp_c = analyze_maternal(data)
    return {
        "risk_level": risk_level.title(),
        "risk_factors": risk_factors if risk_factors else ["No major risk factors detected."],
        "recommended_action": action,
    }


@app.post("/api/records/maternal")
def create_maternal_record(data: MaternalRecordCreate, db: Session = Depends(get_db)):
    risk_level, risk_factors, action, body_temp_c = analyze_maternal(data)
    patient_id = generate_patient_id(db, "Maternal")

    record = PatientRecord(
        patient_id=patient_id,
        type="Maternal",
        name=data.patient_name,
        level=risk_level.title(),
        date=pd.Timestamp.now().strftime("%Y-%m-%d"),
        vitals=json.dumps({
            "age": data.age,
            "systolic_bp": data.systolic_bp,
            "diastolic_bp": data.diastolic_bp,
            "bs": data.bs,
            "body_temp": data.body_temp,
            "heart_rate": data.heart_rate
        }),
        risk_factors=json.dumps(risk_factors if risk_factors else ["No major risk factors detected."]),
        recommended_action=action
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "patient_id": patient_id,
        "risk_level": risk_level.title(),
        "risk_factors": risk_factors if risk_factors else ["No major risk factors detected."],
        "recommended_action": action
    }


@app.post("/api/records/newborn")
def create_newborn_record(data: NewbornRecordCreate, db: Session = Depends(get_db)):
    level, factors, action = analyze_newborn(data)
    patient_id = generate_patient_id(db, "Newborn")

    record = PatientRecord(
        patient_id=patient_id,
        type="Newborn",
        name=data.baby_name,
        mother_name=data.mother_name or "N/A",
        level=level,
        date=pd.Timestamp.now().strftime("%Y-%m-%d"),
        vitals=json.dumps({
            "birth_weight": data.birth_weight,
            "temperature": data.temperature,
            "respiratory_rate": data.respiratory_rate,
            "oxygen_saturation": data.oxygen_saturation,
            "feeding": data.feeding
        }),
        risk_factors=json.dumps(factors if factors else ["No major risk factors detected."]),
        recommended_action=action
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "patient_id": patient_id,
        "risk_level": level,
        "risk_factors": factors if factors else ["No major risk factors detected."],
        "recommended_action": action
    }


@app.get("/api/records")
def get_all_records(db: Session = Depends(get_db)):
    records = db.query(PatientRecord).order_by(PatientRecord.created_at.desc()).all()
    return [serialize(r) for r in records]


@app.get("/api/records/{record_id}")
def get_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    return serialize(r)


@app.put("/api/records/{record_id}")
def update_record(record_id: int, data: RecordUpdate, db: Session = Depends(get_db)):
    r = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    if data.name is not None:
        r.name = data.name
    if data.level is not None:
        r.level = data.level
    if data.notes is not None:
        r.notes = data.notes
    db.commit()
    db.refresh(r)
    return {"message": "Record updated", "id": r.id}


@app.delete("/api/records/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(r)
    db.commit()
    return {"message": "Record deleted", "id": record_id}


@app.delete("/api/records")
def delete_all_records(db: Session = Depends(get_db)):
    db.query(PatientRecord).delete()
    db.commit()
    return {"message": "All records deleted"}