"""
Transformer Health Router - Q-Grid Shield
Provides transformer fleet monitoring, failure prediction, and historical
telemetry data for predictive maintenance.
"""

import random
import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class TransformerInfo(BaseModel):
    """Full transformer record with health metrics."""

    id: str
    name: str
    location: str
    lat: float
    lng: float
    manufacturer: str
    age_years: int
    rated_capacity_mva: float
    health_score: float = Field(..., ge=0, le=100)
    temperature_celsius: float
    load_percent: float = Field(..., ge=0, le=100)
    vibration_mm_s: float
    oil_quality: float = Field(..., ge=0, le=100, description="Dielectric strength index")
    dissolved_gas_ppm: float
    moisture_percent: float
    status: str  # healthy | warning | critical | maintenance
    predicted_failure_date: str | None
    risk_level: str  # low | medium | high | critical
    last_maintenance: str
    next_scheduled_maintenance: str


class TransformerListResponse(BaseModel):
    transformers: list[TransformerInfo]
    total: int
    healthy_count: int
    warning_count: int
    critical_count: int
    timestamp: str


class PredictionDetail(BaseModel):
    transformer_id: str
    transformer_name: str
    failure_probability: float = Field(..., ge=0, le=1)
    predicted_date: str
    days_until_failure: int
    failure_mode: str
    recommended_action: str
    confidence: float = Field(..., ge=0, le=1)
    risk_factors: list[dict]
    estimated_repair_cost_inr: float
    estimated_downtime_hours: int


class HistoryPoint(BaseModel):
    timestamp: str
    temperature_celsius: float
    load_percent: float
    vibration_mm_s: float
    oil_quality: float


class TransformerHistoryResponse(BaseModel):
    transformer_id: str
    transformer_name: str
    history: list[HistoryPoint]
    period_hours: int
    timestamp: str


# ---------------------------------------------------------------------------
# Data seed
# ---------------------------------------------------------------------------

_CENTER_LAT = 28.6139
_CENTER_LNG = 77.2090

_TRANSFORMERS = [
    ("TRF-001", "Karol Bagh 33/11kV", "Karol Bagh", "Siemens"),
    ("TRF-002", "Lajpat Nagar 33/11kV", "Lajpat Nagar", "ABB"),
    ("TRF-003", "Saket 66/33kV", "Saket", "Schneider"),
    ("TRF-004", "Pitampura 33/11kV", "Pitampura", "CGL"),
    ("TRF-005", "Janakpuri 66/33kV", "Janakpuri", "Siemens"),
    ("TRF-006", "Vasant Kunj 33/11kV", "Vasant Kunj", "BHEL"),
    ("TRF-007", "Mayur Vihar 33/11kV", "Mayur Vihar Ph-I", "ABB"),
    ("TRF-008", "Nehru Place 66/33kV", "Nehru Place", "Schneider"),
    ("TRF-009", "Patel Nagar 33/11kV", "Patel Nagar", "Siemens"),
    ("TRF-010", "Rajouri Garden 33/11kV", "Rajouri Garden", "CGL"),
    ("TRF-011", "Model Town 66/33kV", "Model Town", "BHEL"),
    ("TRF-012", "Paschim Vihar 33/11kV", "Paschim Vihar", "ABB"),
    ("TRF-013", "Kalkaji 33/11kV", "Kalkaji", "Schneider"),
    ("TRF-014", "Greater Kailash 66/33kV", "Greater Kailash-I", "Siemens"),
    ("TRF-015", "Hauz Khas 33/11kV", "Hauz Khas", "ABB"),
    ("TRF-016", "Connaught Place 33/11kV", "Connaught Place", "Siemens"),
    ("TRF-017", "Dwarka Sec-21 66/33kV", "Dwarka", "BHEL"),
    ("TRF-018", "Rohini Sec-22 33/11kV", "Rohini", "CGL"),
    ("TRF-019", "Shahdara 33/11kV", "Shahdara", "Schneider"),
    ("TRF-020", "Narela 66/33kV", "Narela", "ABB"),
]

_FAILURE_MODES = [
    "Winding insulation breakdown",
    "Oil degradation / overheating",
    "Bushing failure",
    "Core delamination",
    "Tap changer malfunction",
    "Cooling system failure",
    "Partial discharge escalation",
]

_ACTIONS = [
    "Schedule oil replacement within 30 days",
    "Immediate winding resistance test required",
    "Replace bushing gaskets at next maintenance window",
    "Install online DGA monitor for continuous tracking",
    "Reduce load to 70% until inspection is completed",
    "Plan full overhaul in next planned outage",
    "No action required — continue routine monitoring",
]


def _jitter(center: float, spread: float = 0.08) -> float:
    return round(center + random.uniform(-spread, spread), 6)


def _build_transformer(trf_tuple: tuple) -> TransformerInfo:
    tid, name, location, manufacturer = trf_tuple
    age = random.randint(3, 35)
    rated = random.choice([10, 16, 25, 31.5, 50, 63])

    # Health inversely correlated with age + random noise
    base_health = max(20, 100 - age * 1.8 + random.gauss(0, 8))
    health = round(min(100, max(0, base_health)), 1)

    temp = round(random.uniform(45, 95), 1)
    load = round(random.uniform(25, 98), 1)
    vibration = round(random.uniform(0.5, 8.0), 2)
    oil = round(max(10, 100 - age * 1.5 + random.gauss(0, 6)), 1)
    oil = min(100, oil)
    dga = round(random.uniform(20, 350), 1)
    moisture = round(random.uniform(0.5, 5.0), 2)

    if health < 40:
        status = "critical"
        risk = "critical"
    elif health < 60:
        status = "warning"
        risk = "high"
    elif health < 80:
        status = "warning" if random.random() < 0.3 else "healthy"
        risk = "medium"
    else:
        status = "healthy"
        risk = "low"

    now = datetime.now(timezone.utc)
    predicted_date = None
    if health < 70:
        days_out = int((health / 100) * 365 * 2)
        predicted_date = (now + timedelta(days=days_out)).strftime("%Y-%m-%d")

    last_maint = (now - timedelta(days=random.randint(30, 365))).strftime("%Y-%m-%d")
    next_maint = (now + timedelta(days=random.randint(30, 180))).strftime("%Y-%m-%d")

    return TransformerInfo(
        id=tid,
        name=name,
        location=location,
        lat=_jitter(_CENTER_LAT),
        lng=_jitter(_CENTER_LNG),
        manufacturer=manufacturer,
        age_years=age,
        rated_capacity_mva=rated,
        health_score=health,
        temperature_celsius=temp,
        load_percent=load,
        vibration_mm_s=vibration,
        oil_quality=oil,
        dissolved_gas_ppm=dga,
        moisture_percent=moisture,
        status=status,
        predicted_failure_date=predicted_date,
        risk_level=risk,
        last_maintenance=last_maint,
        next_scheduled_maintenance=next_maint,
    )


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()


@router.get("/", response_model=TransformerListResponse)
async def list_transformers() -> TransformerListResponse:
    """
    Return the full fleet of monitored transformers with live health metrics.

    Includes temperature, load, vibration, oil quality, dissolved-gas
    analysis, and predictive-maintenance risk levels.
    """
    transformers = [_build_transformer(t) for t in _TRANSFORMERS]
    healthy = sum(1 for t in transformers if t.status == "healthy")
    warning = sum(1 for t in transformers if t.status == "warning")
    critical = sum(1 for t in transformers if t.status in ("critical", "maintenance"))

    return TransformerListResponse(
        transformers=transformers,
        total=len(transformers),
        healthy_count=healthy,
        warning_count=warning,
        critical_count=critical,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/{transformer_id}/predict", response_model=PredictionDetail)
async def predict_failure(
    transformer_id: str = Path(..., description="Transformer ID, e.g. TRF-001"),
) -> PredictionDetail:
    """
    Return detailed failure prediction for a specific transformer.

    Includes failure probability, predicted date, failure mode, recommended
    action, risk factors, and estimated repair cost.
    """
    valid_ids = {t[0] for t in _TRANSFORMERS}
    if transformer_id not in valid_ids:
        raise HTTPException(status_code=404, detail=f"Transformer '{transformer_id}' not found")

    trf_data = next(t for t in _TRANSFORMERS if t[0] == transformer_id)
    trf = _build_transformer(trf_data)

    failure_prob = round(max(0, min(1, (100 - trf.health_score) / 100 + random.uniform(-0.05, 0.1))), 3)
    days_until = int((1 - failure_prob) * 365 * 2) + random.randint(10, 90)
    predicted = (datetime.now(timezone.utc) + timedelta(days=days_until)).strftime("%Y-%m-%d")

    risk_factors = [
        {"factor": "Age", "value": f"{trf.age_years} years", "severity": "high" if trf.age_years > 25 else "medium" if trf.age_years > 15 else "low"},
        {"factor": "Temperature", "value": f"{trf.temperature_celsius}°C", "severity": "high" if trf.temperature_celsius > 80 else "medium" if trf.temperature_celsius > 65 else "low"},
        {"factor": "Oil Quality", "value": f"{trf.oil_quality}%", "severity": "high" if trf.oil_quality < 40 else "medium" if trf.oil_quality < 65 else "low"},
        {"factor": "Load", "value": f"{trf.load_percent}%", "severity": "high" if trf.load_percent > 90 else "medium" if trf.load_percent > 75 else "low"},
        {"factor": "Vibration", "value": f"{trf.vibration_mm_s} mm/s", "severity": "high" if trf.vibration_mm_s > 6 else "medium" if trf.vibration_mm_s > 3 else "low"},
        {"factor": "Dissolved Gas", "value": f"{trf.dissolved_gas_ppm} ppm", "severity": "high" if trf.dissolved_gas_ppm > 250 else "medium" if trf.dissolved_gas_ppm > 100 else "low"},
        {"factor": "Moisture", "value": f"{trf.moisture_percent}%", "severity": "high" if trf.moisture_percent > 3.5 else "medium" if trf.moisture_percent > 2 else "low"},
    ]

    return PredictionDetail(
        transformer_id=transformer_id,
        transformer_name=trf.name,
        failure_probability=failure_prob,
        predicted_date=predicted,
        days_until_failure=days_until,
        failure_mode=random.choice(_FAILURE_MODES),
        recommended_action=random.choice(_ACTIONS),
        confidence=round(random.uniform(0.75, 0.96), 2),
        risk_factors=risk_factors,
        estimated_repair_cost_inr=round(random.uniform(200_000, 3_500_000), -3),
        estimated_downtime_hours=random.randint(8, 120),
    )


@router.get("/{transformer_id}/history", response_model=TransformerHistoryResponse)
async def get_transformer_history(
    transformer_id: str = Path(..., description="Transformer ID, e.g. TRF-001"),
) -> TransformerHistoryResponse:
    """
    Return historical telemetry (temperature, load, vibration, oil quality)
    for a specific transformer over the last 72 hours at 30-minute intervals.
    """
    valid_ids = {t[0] for t in _TRANSFORMERS}
    if transformer_id not in valid_ids:
        raise HTTPException(status_code=404, detail=f"Transformer '{transformer_id}' not found")

    trf_data = next(t for t in _TRANSFORMERS if t[0] == transformer_id)
    name = trf_data[1]

    now = datetime.now(timezone.utc)
    period_hours = 72
    interval_min = 30
    num_points = (period_hours * 60) // interval_min

    history: list[HistoryPoint] = []
    base_temp = random.uniform(50, 65)
    base_load = random.uniform(40, 60)
    base_vib = random.uniform(1.5, 3.0)
    base_oil = random.uniform(65, 85)

    for i in range(num_points):
        ts = now - timedelta(minutes=(num_points - i) * interval_min)
        hour = ts.hour + ts.minute / 60.0

        # Daily cycle: temp & load peak in afternoon
        cycle = math.sin(math.pi * (hour - 6) / 12) if 6 <= hour <= 22 else -0.3
        temp = round(base_temp + 20 * cycle + random.gauss(0, 1.5), 1)
        load = round(max(10, min(100, base_load + 30 * cycle + random.gauss(0, 2))), 1)
        vib = round(max(0.3, base_vib + 1.5 * max(0, cycle) + random.gauss(0, 0.3)), 2)
        oil = round(max(10, min(100, base_oil - 0.002 * i + random.gauss(0, 0.5))), 1)

        history.append(
            HistoryPoint(
                timestamp=ts.isoformat(),
                temperature_celsius=temp,
                load_percent=load,
                vibration_mm_s=vib,
                oil_quality=oil,
            )
        )

    return TransformerHistoryResponse(
        transformer_id=transformer_id,
        transformer_name=name,
        history=history,
        period_hours=period_hours,
        timestamp=now.isoformat(),
    )
