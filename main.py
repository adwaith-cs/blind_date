from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional
import numpy as np

from ml_engine import (
    OrbitalPhysicsEngine,
    ConjunctionRiskClassifier,
    OrbitalAnomalyDetector
)

app = FastAPI(
    title="OrbitSentinel ML Backend Engine",
    description="Production Machine Learning REST API for Space Situational Awareness (SSA)",
    version="2.4.0"
)

# Enable CORS for React Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Engines
risk_classifier = ConjunctionRiskClassifier()
anomaly_detector = OrbitalAnomalyDetector()


# Request Schemas
class TLEPropagationRequest(BaseModel):
    norad_id: str
    tle_line1: str = Field(..., example="1 25544U 98067A   24065.52222222  .00016717  00000-0  30123-3 0  9993")
    tle_line2: str = Field(..., example="2 25544  51.6416 250.1234 0004567 120.4567 240.1234 15.49812345421232")

class ConjunctionAssessmentRequest(BaseModel):
    primary_norad: str
    secondary_norad: str
    miss_distance_km: float = Field(..., ge=0.0)
    relative_velocity_kms: float = Field(..., ge=0.0)
    covariance_uncertainty: float = Field(..., ge=0.0)

class TelemetryAnomalyRequest(BaseModel):
    norad_id: str
    altitude_km: float
    velocity_kms: float
    drift_rate: float


# REST API Endpoints

@app.get("/")
def health_check():
    return {
        "status": "ONLINE",
        "system": "OrbitSentinel ML Engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/v1/propagate")
def propagate_orbit(payload: TLEPropagationRequest):
    """Propagates SGP4 TLE vectors to get current 3D position and velocity."""
    try:
        now = datetime.now(timezone.utc)
        pos, vel = OrbitalPhysicsEngine.propagate_tle(payload.tle_line1, payload.tle_line2, now)
        return {
            "norad_id": payload.norad_id,
            "timestamp": now.isoformat(),
            "position_eci_km": {"x": float(pos[0]), "y": float(pos[1]), "z": float(pos[2])},
            "velocity_kms": {"vx": float(vel[0]), "vy": float(vel[1]), "vz": float(vel[2])},
            "altitude_km": round(float(np.linalg.norm(pos)) - 6371.0, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/assess-conjunction")
def assess_conjunction_risk(payload: ConjunctionAssessmentRequest):
    """Predicts probability of collision between two space objects using Machine Learning."""
    assessment = risk_classifier.predict_risk(
        payload.miss_distance_km,
        payload.relative_velocity_kms,
        payload.covariance_uncertainty
    )
    return {
        "primary_object": payload.primary_norad,
        "secondary_object": payload.secondary_norad,
        "assessment": assessment,
        "evaluated_at": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/v1/detect-anomaly")
def detect_telemetry_anomaly(payload: TelemetryAnomalyRequest):
    """Detects irregular maneuvers or uncontrolled atmospheric decay."""
    result = anomaly_detector.detect_anomaly(
        payload.altitude_km,
        payload.velocity_kms,
        payload.drift_rate
    )
    return {
        "norad_id": payload.norad_id,
        "analysis": result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
