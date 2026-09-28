from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import json

from database import init_db, get_db, PatientRecord

app = FastAPI()

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
init_db()

# Load the trained AI model and label encoder
model = joblib.load('maternal_risk_model.pkl')
label_encoder = joblib.load('label_encoder.pkl')


# ---------- Pydantic Models ----------
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


# ---------- Maternal AI Prediction (test endpoint) ----------
@app.post("/api/predict/maternal")
def predict_maternal(data: MaternalData):
    input_data = pd.DataFrame([[
        data.age, data.systolic_bp, data.diastolic_bp,
        data.bs, data.body_temp, data.heart_rate
    ]], columns=['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate'])

    prediction_encoded = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]
    classes = label_encoder.classes_

    print(f"\n--- New Maternal Assessment ---")
    print(f"Input: {data.dict()}")
    print(f"Prediction: {label_encoder.inverse_transform([prediction_encoded])[0]}")
    print(f"Confidence: {dict(zip(classes, probabilities.round(3)))}")

    risk_level = label_encoder.inverse_transform([prediction_encoded])[0]

    risk_factors = []
    if data.systolic_bp >= 140 or data.diastolic_bp >= 90:
        risk_factors.append(f"High blood pressure ({data.systolic_bp}/{data.diastolic_bp} mmHg)")
    if data.body_temp >= 100.4:
        risk_factors.append(f"Elevated temperature ({data.body_temp}°F)")
    if data.heart_rate > 100:
        risk_factors.append(f"Increased pulse rate ({data.heart_rate} bpm)")
    if data.bs > 11:
        risk_factors.append(f"High blood sugar ({data.bs} mmol/L)")
    if data.age >= 40:
        risk_factors.append(f"Advanced maternal age ({data.age} years)")
    if data.age <= 17:
        risk_factors.append(f"Young maternal age ({data.age} years)")

    if "high" in risk_level.lower():
        action = "Please consider further clinical evaluation and close monitoring. Refer to a healthcare professional immediately."
    elif "mid" in risk_level.lower():
        action = "Monitor closely and follow up at the next visit."
    else:
        action = "Continue routine monitoring. No immediate action required."

    return {
        "risk_level": risk_level.title(),
        "risk_factors": risk_factors if risk_factors else ["No major risk factors detected."],
        "recommended_action": action,
        "confidence": {str(cls): float(prob) for cls, prob in zip(classes, probabilities)}
    }


# ---------- Save Maternal Record ----------
@app.post("/api/records/maternal")
def create_maternal_record(data: MaternalRecordCreate, db: Session = Depends(get_db)):
    # Run prediction
    input_data = pd.DataFrame([[
        data.age, data.systolic_bp, data.diastolic_bp,
        data.bs, data.body_temp, data.heart_rate
    ]], columns=['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate'])

    prediction_encoded = model.predict(input_data)[0]
    risk_level = label_encoder.inverse_transform([prediction_encoded])[0]

    # Risk factors
    risk_factors = []
    if data.systolic_bp >= 140 or data.diastolic_bp >= 90:
        risk_factors.append(f"High blood pressure ({data.systolic_bp}/{data.diastolic_bp} mmHg)")
    if data.body_temp >= 100.4:
        risk_factors.append(f"Elevated temperature ({data.body_temp}°F)")
    if data.heart_rate > 100:
        risk_factors.append(f"Increased pulse rate ({data.heart_rate} bpm)")
    if data.bs > 11:
        risk_factors.append(f"High blood sugar ({data.bs} mmol/L)")
    if data.age >= 40:
        risk_factors.append(f"Advanced maternal age ({data.age} years)")
    if data.age <= 17:
        risk_factors.append(f"Young maternal age ({data.age} years)")

    if "high" in risk_level.lower():
        action = "Please consider further clinical evaluation and close monitoring. Refer to a healthcare professional immediately."
    elif "mid" in risk_level.lower():
        action = "Monitor closely and follow up at the next visit."
    else:
        action = "Continue routine monitoring. No immediate action required."

    # Save to database
    record = PatientRecord(
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
        "risk_level": risk_level.title(),
        "risk_factors": risk_factors if risk_factors else ["No major risk factors detected."],
        "recommended_action": action
    }


# ---------- Save Newborn Record (rule-based) ----------
@app.post("/api/records/newborn")
def create_newborn_record(data: NewbornRecordCreate, db: Session = Depends(get_db)):
    factors = []
    if data.birth_weight < 2.5:
        factors.append(f"Low birth weight ({data.birth_weight} kg)")
    if data.temperature < 36.5:
        factors.append(f"Low temperature ({data.temperature}°C)")
    if data.respiratory_rate > 60:
        factors.append(f"Increased respiratory rate ({data.respiratory_rate} breaths/min)")
    if data.oxygen_saturation < 90:
        factors.append(f"Low oxygen saturation ({data.oxygen_saturation}%)")
    if data.feeding == "Poor feeding":
        factors.append("Poor feeding observation")

    level = "Low"
    if len(factors) >= 3:
        level = "High"
    elif len(factors) > 0:
        level = "Moderate"

    action = "Routine newborn care." if level == "Low" else "Monitor closely, provide supportive care, and consult a neonatologist."

    record = PatientRecord(
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
        "risk_level": level,
        "risk_factors": factors if factors else ["No major risk factors detected."],
        "recommended_action": action
    }


# ---------- Get All Records ----------
@app.get("/api/records")
def get_all_records(db: Session = Depends(get_db)):
    records = db.query(PatientRecord).order_by(PatientRecord.created_at.desc()).all()
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "type": r.type,
            "name": r.name,
            "mother_name": r.mother_name,
            "level": r.level,
            "date": r.date,
            "vitals": json.loads(r.vitals) if r.vitals else {},
            "risk_factors": json.loads(r.risk_factors) if r.risk_factors else [],
            "recommended_action": r.recommended_action,
            "notes": r.notes,
        })
    return result


# ---------- Get Single Record ----------
@app.get("/api/records/{record_id}")
def get_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    return {
        "id": r.id,
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


# ---------- Update Record ----------
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


# ---------- Delete Record ----------
@app.delete("/api/records/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(r)
    db.commit()
    return {"message": "Record deleted", "id": record_id}


# ---------- Delete All Records ----------
@app.delete("/api/records")
def delete_all_records(db: Session = Depends(get_db)):
    db.query(PatientRecord).delete()
    db.commit()
    return {"message": "All records deleted"}