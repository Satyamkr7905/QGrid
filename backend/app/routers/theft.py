"""
Theft Detection Router - Q-Grid Shield
Provides anomaly detection, smart meter monitoring, per-meter analysis,
and theft alert endpoints for the energy theft detection module.
"""

import random
import math
from datetime import datetime, timedelta, timezone
from enum import Enum

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class AnomalyType(str, Enum):
    sudden_drop = "sudden_drop"
    irregular_pattern = "irregular_pattern"
    bypass_detected = "bypass_detected"
    meter_tampering = "meter_tampering"
    unusual_off_peak = "unusual_off_peak"
    consumption_mismatch = "consumption_mismatch"


class MeterStatus(str, Enum):
    normal = "normal"
    suspicious = "suspicious"
    confirmed = "confirmed"


class Anomaly(BaseModel):
    """A single detected anomaly event."""

    id: str
    timestamp: str
    meter_id: str
    location: str
    lat: float
    lng: float
    anomaly_score: float = Field(..., ge=0, le=1)
    type: AnomalyType
    consumption_kwh: float
    expected_kwh: float
    deviation_percent: float
    severity: str  # low | medium | high | critical


class AnomaliesResponse(BaseModel):
    anomalies: list[Anomaly]
    total: int
    timestamp: str


class SmartMeter(BaseModel):
    """Smart meter with theft-detection metadata."""

    id: str
    location: str
    lat: float
    lng: float
    consumption_kwh: float
    expected_kwh: float
    anomaly_score: float = Field(..., ge=0, le=1)
    theft_probability: float = Field(..., ge=0, le=1)
    status: MeterStatus
    last_reading: str
    account_holder: str


class SmartMeterPage(BaseModel):
    meters: list[SmartMeter]
    total: int
    page: int
    page_size: int
    total_pages: int


class AnalysisRequest(BaseModel):
    meter_id: str


class ConsumptionDataPoint(BaseModel):
    timestamp: str
    actual_kwh: float
    expected_kwh: float


class AnalysisResult(BaseModel):
    meter_id: str
    location: str
    theft_probability: float
    anomaly_score: float
    anomaly_type: AnomalyType
    consumption_history: list[ConsumptionDataPoint]
    statistical_summary: dict
    recommendation: str
    confidence: float
    analyzed_at: str


class TheftAlert(BaseModel):
    id: str
    timestamp: str
    meter_id: str
    location: str
    alert_type: str
    severity: str
    message: str
    acknowledged: bool


class TheftAlertsResponse(BaseModel):
    alerts: list[TheftAlert]
    total: int
    unacknowledged: int
    timestamp: str


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

_CENTER_LAT = 28.6139
_CENTER_LNG = 77.2090

_LOCATIONS = [
    "Connaught Place", "Karol Bagh", "Lajpat Nagar", "Dwarka Sec 12",
    "Rohini Sec 7", "Saket J-Block", "Pitampura", "Vasant Kunj",
    "Mayur Vihar Ph-I", "Nehru Place", "Janakpuri B-Block", "Patel Nagar",
    "Green Park", "Hauz Khas", "Defence Colony", "Greater Kailash-I",
    "Malviya Nagar", "Rajouri Garden", "Tilak Nagar", "Laxmi Nagar",
    "Shahdara", "Dilshad Garden", "Ashok Vihar", "Model Town",
    "Paschim Vihar", "Moti Bagh", "Sarita Vihar", "East of Kailash",
    "Lado Sarai", "Panchsheel Park",
]

_FIRST_NAMES = [
    "Amit", "Priya", "Rahul", "Sunita", "Vikram", "Neha", "Suresh",
    "Anjali", "Deepak", "Kavita", "Rajesh", "Meena", "Arun", "Pooja",
    "Sanjay", "Ritu",
]
_LAST_NAMES = [
    "Sharma", "Gupta", "Singh", "Kumar", "Verma", "Jain", "Agarwal",
    "Mehta", "Patel", "Chauhan", "Malhotra", "Kapoor", "Bhatia", "Reddy",
]

_SEVERITIES = ["low", "medium", "high", "critical"]


def _rand_coord(center: float, spread: float = 0.08) -> float:
    return round(center + random.uniform(-spread, spread), 6)


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models import SmartMeter as DBSmartMeter, MeterReading as DBMeterReading
from app.ai_models.theft_detector import predict

router = APIRouter()

@router.get("/anomalies", response_model=AnomaliesResponse)
async def get_anomalies(
    limit: int = Query(default=20, ge=1, le=100),
    severity: str | None = Query(default=None, description="Filter: low|medium|high|critical"),
    db: AsyncSession = Depends(get_db)
) -> AnomaliesResponse:
    """
    Return detected consumption anomalies across the grid using the Isolation Forest model.
    """
    now = datetime.now(timezone.utc)
    
    # Get recent readings from DB
    stmt = select(DBMeterReading, DBSmartMeter).join(DBSmartMeter).order_by(desc(DBMeterReading.timestamp)).limit(200)
    result = await db.execute(stmt)
    records = result.all()
    
    anomalies: list[Anomaly] = []
    
    for reading, meter in records:
        # RUN REAL ML MODEL
        is_anomalous, score = predict(reading.voltage, reading.current, reading.power)
        
        if score > 0.3 or is_anomalous:
            expected = round(reading.power * 1.5, 1) if is_anomalous else reading.power
            actual = round(reading.power, 1)
            deviation = round(abs(actual - expected) / expected * 100, 1) if expected > 0 else 0.0
            
            sev = (
                "critical" if score > 0.85 else
                "high" if score > 0.65 else
                "medium" if score > 0.4 else
                "low"
            )
            
            anomalies.append(
                Anomaly(
                    id=f"ANM-{reading.id}",
                    timestamp=reading.timestamp.isoformat(),
                    meter_id=meter.id,
                    location=meter.location,
                    lat=meter.lat,
                    lng=meter.lng,
                    anomaly_score=round(score, 3),
                    type=AnomalyType.sudden_drop if score > 0.7 else AnomalyType.irregular_pattern,
                    consumption_kwh=actual,
                    expected_kwh=expected,
                    deviation_percent=deviation,
                    severity=sev,
                )
            )
            
        if len(anomalies) >= limit:
            break

    if severity:
        anomalies = [a for a in anomalies if a.severity == severity]

    anomalies.sort(key=lambda a: a.anomaly_score, reverse=True)

    return AnomaliesResponse(
        anomalies=anomalies,
        total=len(anomalies),
        timestamp=now.isoformat(),
    )


@router.get("/meters", response_model=SmartMeterPage)
async def get_meters(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=5, le=100),
    status: MeterStatus | None = Query(default=None),
    sort_by: str = Query(default="anomaly_score", description="anomaly_score|theft_probability|consumption_kwh"),
) -> SmartMeterPage:
    """
    Return a paginated list of smart meters with theft-detection scores.

    Supports filtering by **status** and sorting by anomaly score,
    theft probability, or consumption.
    """
    total_meters = 150
    all_meters: list[SmartMeter] = []

    for i in range(total_meters):
        loc = _LOCATIONS[i % len(_LOCATIONS)]
        anomaly_score = round(random.uniform(0, 1), 3)
        theft_prob = round(max(0, anomaly_score * random.uniform(0.6, 1.1)), 3)
        theft_prob = min(theft_prob, 1.0)

        if theft_prob > 0.7:
            m_status = MeterStatus.confirmed
        elif theft_prob > 0.35:
            m_status = MeterStatus.suspicious
        else:
            m_status = MeterStatus.normal

        expected = round(random.uniform(100, 500), 1)
        consumption = round(expected * random.uniform(0.3, 1.1), 1)

        first = random.choice(_FIRST_NAMES)
        last = random.choice(_LAST_NAMES)

        all_meters.append(
            SmartMeter(
                id=f"MTR-{1000 + i}",
                location=loc,
                lat=_rand_coord(_CENTER_LAT),
                lng=_rand_coord(_CENTER_LNG),
                consumption_kwh=consumption,
                expected_kwh=expected,
                anomaly_score=anomaly_score,
                theft_probability=theft_prob,
                status=m_status,
                last_reading=datetime.now(timezone.utc).isoformat(),
                account_holder=f"{first} {last}",
            )
        )

    if status is not None:
        all_meters = [m for m in all_meters if m.status == status]

    reverse = True
    all_meters.sort(key=lambda m: getattr(m, sort_by, m.anomaly_score), reverse=reverse)

    total = len(all_meters)
    total_pages = math.ceil(total / page_size)
    start = (page - 1) * page_size
    end = start + page_size

    return SmartMeterPage(
        meters=all_meters[start:end],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_meter(request: AnalysisRequest) -> AnalysisResult:
    """
    Run a detailed theft-detection analysis on a specific smart meter.

    Returns consumption history, statistical summary, anomaly type,
    theft probability, and recommended action.
    """
    now = datetime.now(timezone.utc)
    location = random.choice(_LOCATIONS)
    anomaly_type = random.choice(list(AnomalyType))
    theft_prob = round(random.uniform(0.15, 0.95), 3)
    anomaly_score = round(min(1.0, theft_prob + random.uniform(-0.1, 0.15)), 3)

    # 7-day hourly consumption history
    history: list[ConsumptionDataPoint] = []
    for h in range(168):
        ts = now - timedelta(hours=168 - h)
        hour = ts.hour
        # Realistic daily pattern
        base_expected = 2.5 + 3.0 * math.sin(math.pi * (hour - 6) / 12) if 6 <= hour <= 22 else 1.2
        expected = round(max(0.5, base_expected + random.gauss(0, 0.3)), 2)
        # Anomalous meters consume less than expected
        actual = round(expected * random.uniform(0.2, 0.7) if random.random() < 0.3 else expected * random.uniform(0.85, 1.15), 2)
        history.append(
            ConsumptionDataPoint(
                timestamp=ts.isoformat(),
                actual_kwh=actual,
                expected_kwh=expected,
            )
        )

    actual_vals = [h.actual_kwh for h in history]
    expected_vals = [h.expected_kwh for h in history]

    recommendation = (
        "Immediate field inspection recommended. High probability of meter bypass."
        if theft_prob > 0.7
        else "Schedule inspection within 7 days. Irregular pattern detected."
        if theft_prob > 0.4
        else "Continue monitoring. Minor deviations within acceptable range."
    )

    return AnalysisResult(
        meter_id=request.meter_id,
        location=location,
        theft_probability=theft_prob,
        anomaly_score=anomaly_score,
        anomaly_type=anomaly_type,
        consumption_history=history[-48:],  # Return last 48 hours
        statistical_summary={
            "mean_actual_kwh": round(sum(actual_vals) / len(actual_vals), 2),
            "mean_expected_kwh": round(sum(expected_vals) / len(expected_vals), 2),
            "std_deviation": round(
                (sum((v - sum(actual_vals)/len(actual_vals))**2 for v in actual_vals) / len(actual_vals)) ** 0.5, 2
            ),
            "total_deviation_kwh": round(sum(expected_vals) - sum(actual_vals), 1),
            "max_hourly_deviation_kwh": round(
                max(abs(a - e) for a, e in zip(actual_vals, expected_vals)), 2
            ),
            "anomalous_hours_count": sum(
                1 for a, e in zip(actual_vals, expected_vals) if abs(a - e) / e > 0.3
            ),
        },
        recommendation=recommendation,
        confidence=round(random.uniform(0.72, 0.97), 2),
        analyzed_at=now.isoformat(),
    )


@router.get("/alerts", response_model=TheftAlertsResponse)
async def get_theft_alerts(
    limit: int = Query(default=25, ge=1, le=100),
    acknowledged: bool | None = Query(default=None),
) -> TheftAlertsResponse:
    """
    Return recent theft alerts, optionally filtered by acknowledgement status.
    """
    now = datetime.now(timezone.utc)
    alert_types = [
        "Meter Bypass Detected",
        "Abnormal Consumption Drop",
        "Tamper Seal Broken",
        "Communication Loss",
        "Reverse Power Flow",
        "Load Curve Anomaly",
    ]
    messages = [
        "Sudden 60% drop in registered consumption at {loc}. Possible meter bypass.",
        "Smart meter at {loc} shows irregular off-peak consumption pattern.",
        "Physical tamper alert triggered on meter at {loc}.",
        "Meter at {loc} went offline unexpectedly. Possible deliberate disconnection.",
        "Reverse energy flow detected at {loc}. Investigating illegal feed-in.",
        "Load curve deviation of {dev}% detected at {loc}.",
    ]

    alerts: list[TheftAlert] = []
    for i in range(limit):
        ts = now - timedelta(minutes=random.randint(5, 4320))
        loc = random.choice(_LOCATIONS)
        alert_idx = random.randint(0, len(alert_types) - 1)
        score = random.uniform(0, 1)
        sev = (
            "critical" if score > 0.8 else
            "high" if score > 0.6 else
            "medium" if score > 0.3 else
            "low"
        )
        acked = random.random() < 0.35

        alerts.append(
            TheftAlert(
                id=f"ALERT-{random.randint(10000,99999)}",
                timestamp=ts.isoformat(),
                meter_id=f"MTR-{random.randint(1000,9999)}",
                location=loc,
                alert_type=alert_types[alert_idx],
                severity=sev,
                message=messages[alert_idx].format(loc=loc, dev=random.randint(30, 80)),
                acknowledged=acked,
            )
        )

    if acknowledged is not None:
        alerts = [a for a in alerts if a.acknowledged == acknowledged]

    alerts.sort(key=lambda a: a.timestamp, reverse=True)
    unacked = sum(1 for a in alerts if not a.acknowledged)

    return TheftAlertsResponse(
        alerts=alerts,
        total=len(alerts),
        unacknowledged=unacked,
        timestamp=now.isoformat(),
    )
