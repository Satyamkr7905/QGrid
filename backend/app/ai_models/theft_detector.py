import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sqlalchemy import create_engine
import numpy as np

# Adjust path to find config
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.config import get_settings

settings = get_settings()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "theft_model.joblib")

def get_sync_engine():
    # Convert asyncpg to psycopg2 for pandas compatibility
    sync_url = settings.get_database_url.replace("+asyncpg", "")
    if "+aiosqlite" in settings.get_database_url:
        sync_url = settings.get_database_url.replace("+aiosqlite", "")
    return create_engine(sync_url)

def train_model():
    print("Fetching training data from database...")
    engine = get_sync_engine()
    
    # Read all readings
    df = pd.read_sql("SELECT voltage, current, power FROM meter_readings", con=engine)
    
    if len(df) < 10:
        print("Not enough data to train model.")
        return
        
    print(f"Training Isolation Forest on {len(df)} records...")
    
    # We expect normal voltage ~220-240, current ~5-20
    # The Isolation Forest will find outliers
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(df[['voltage', 'current', 'power']])
    
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

def predict(voltage: float, current: float, power: float) -> tuple[bool, float]:
    """
    Returns (is_anomalous, anomaly_score)
    is_anomalous: True if theft suspected
    anomaly_score: 0.0 to 1.0 (higher means more anomalous)
    """
    if not os.path.exists(MODEL_PATH):
        return False, 0.0
        
    model = joblib.load(MODEL_PATH)
    
    df = pd.DataFrame({'voltage': [voltage], 'current': [current], 'power': [power]})
    
    # Predict returns 1 for inliers, -1 for outliers
    prediction = model.predict(df)[0]
    
    # Decision function returns average anomaly score. Negative means outlier.
    # We normalize to a 0-1 range roughly.
    raw_score = model.decision_function(df)[0]
    
    # Scikit-learn decision function usually goes from approx -0.5 to 0.5.
    # We want 0 to 1 where 1 is highly anomalous.
    normalized_score = max(0.0, min(1.0, 0.5 - raw_score))
    
    is_anomalous = bool(prediction == -1)
    
    return is_anomalous, float(normalized_score)

if __name__ == "__main__":
    train_model()
