import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sgp4.api import Satrec, jday
from sklearn.ensemble import IsolationForest
import xgboost as xgb

class OrbitalPhysicsEngine:
    """Propagates orbits using SGP4 model based on Two-Line Element (TLE) sets."""
    
    @staticmethod
    def propagate_tle(line1: str, line2: str, target_time: datetime):
        """Calculates 3D Position (km) and Velocity (km/s) vectors for a satellite."""
        satellite = Satrec.twoline2rv(line1, line2)
        jd, fr = jday(
            target_time.year, target_time.month, target_time.day,
            target_time.hour, target_time.minute, target_time.second
        )
        e, r, v = satellite.sgp4(jd, fr)
        if e != 0:
            raise ValueError(f"SGP4 Propagation Error Code: {e}")
        return np.array(r), np.array(v)

    @staticmethod
    def calculate_miss_distance(r1: np.ndarray, r2: np.ndarray) -> float:
        """Calculates Euclidean distance (in kilometers) between two spatial points."""
        return float(np.linalg.norm(r1 - r2))


class ConjunctionRiskClassifier:
    """Predicts collision probability and risk level using an ML model."""
    
    def __init__(self):
        # Initializing XGBoost Classifier
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.05,
            eval_metric="logloss"
        )
        self._bootstrap_synthetic_model()

    def _bootstrap_synthetic_model(self):
        """Trains an initial model on synthetic Conjunction Data Message (CDM) features."""
        np.random.seed(42)
        n_samples = 2000
        
        # Synthetic features: miss_distance (km), relative_velocity (km/s), covariance_sum (m^2)
        miss_dist = np.random.exponential(scale=2.0, size=n_samples)
        rel_vel = np.random.uniform(1.0, 15.0, size=n_samples)
        cov_sum = np.random.uniform(10.0, 500.0, size=n_samples)
        
        X = np.column_stack((miss_dist, rel_vel, cov_sum))
        
        # Physics-based heuristic for synthetic target ground truth:
        # High risk if miss distance < 0.5km AND covariance uncertainty is large
        y = ((miss_dist < 0.5) & (cov_sum > 100.0)).astype(int)
        
        self.model.fit(X, y)

    def predict_risk(self, miss_distance_km: float, relative_velocity_kms: float, covariance_error: float):
        """Predicts probability of collision and categorizes risk."""
        features = np.array([[miss_distance_km, relative_velocity_kms, covariance_error]])
        probability = float(self.model.predict_proba(features)[0][1])
        
        if probability >= 0.75:
            risk_level = "Critical"
        elif probability >= 0.40:
            risk_level = "High"
        elif probability >= 0.15:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        return {
            "collision_probability": round(probability, 6),
            "risk_level": risk_level,
            "maneuver_recommended": probability >= 0.40
        }


class OrbitalAnomalyDetector:
    """Uses Unsupervised Isolation Forest to detect telemetry & trajectory anomalies."""
    
    def __init__(self):
        self.detector = IsolationForest(contamination=0.05, random_state=42)
        self._train_baseline()

    def _train_baseline(self):
        """Trains baseline model on nominal orbital telemetry (Altitude, Velocity, Drift)."""
        np.random.seed(42)
        nominal_altitude = np.random.normal(loc=550, scale=10, size=1000)
        nominal_velocity = np.random.normal(loc=7.59, scale=0.05, size=1000)
        nominal_drift = np.random.normal(loc=0.001, scale=0.0005, size=1000)
        
        X_train = np.column_stack((nominal_altitude, nominal_velocity, nominal_drift))
        self.detector.fit(X_train)

    def detect_anomaly(self, altitude_km: float, velocity_kms: float, drift_rate: float):
        """Evaluates whether current orbital parameter state is anomalous."""
        sample = np.array([[altitude_km, velocity_kms, drift_rate]])
        prediction = self.detector.predict(sample)[0] # -1 = Anomaly, 1 = Normal
        score = float(-self.detector.score_samples(sample)[0]) # Anomaly score
        
        return {
            "is_anomaly": bool(prediction == -1),
            "anomaly_score": round(score, 4),
            "status": "Anomalous Maneuver / TLE Decay" if prediction == -1 else "Nominal"
        }
