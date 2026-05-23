"""
WebSocket Router - Q-Grid Shield
Provides real-time WebSocket streams for live grid metric updates
and alert notifications.
"""

import asyncio
import json
import random
import math
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()

# ---------------------------------------------------------------------------
# Data generators
# ---------------------------------------------------------------------------

_LOCATIONS = [
    "Connaught Place", "Karol Bagh", "Lajpat Nagar", "Dwarka Sec 12",
    "Rohini Sec 7", "Saket J-Block", "Pitampura", "Vasant Kunj",
    "Mayur Vihar Ph-I", "Nehru Place", "Janakpuri B-Block", "Patel Nagar",
    "Green Park", "Hauz Khas", "Defence Colony", "Greater Kailash-I",
    "Shahdara", "Model Town", "Paschim Vihar", "Narela",
]

_ALERT_TYPES = [
    ("THEFT_DETECTED", "critical", "Energy theft detected at {loc}. Anomaly score: {score:.2f}"),
    ("OVERLOAD_WARNING", "high", "Transformer overload warning at {loc}. Load: {load}%"),
    ("OUTAGE_DETECTED", "critical", "Power outage detected in {loc} zone. {nodes} nodes affected."),
    ("VOLTAGE_FLUCTUATION", "medium", "Voltage fluctuation at {loc}. Deviation: {dev}%"),
    ("EQUIPMENT_FAULT", "high", "Equipment fault alarm triggered at {loc} substation."),
    ("MAINTENANCE_DUE", "low", "Scheduled maintenance due for transformer at {loc}."),
    ("RENEWABLE_DROP", "medium", "Solar generation dropped {drop}% at {loc} due to cloud cover."),
    ("CYBER_ALERT", "critical", "Suspicious network activity detected on {loc} SCADA system."),
    ("DEMAND_SPIKE", "medium", "Unexpected demand spike in {loc}. +{spike}MW above forecast."),
    ("BATTERY_LOW", "low", "Battery storage at {loc} below 20% capacity."),
]


def _generate_grid_update() -> dict:
    """Generate a single grid metrics update packet."""
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60.0

    # Realistic daily demand curve
    demand_factor = 0.5 + 0.5 * math.sin(math.pi * (hour - 4) / 12) if 4 <= hour <= 22 else 0.35

    total_nodes = 1247
    active = total_nodes - random.randint(3, 25)
    demand_mw = round(2800 + 2200 * demand_factor + random.gauss(0, 80), 1)
    supply_mw = round(demand_mw * random.uniform(1.02, 1.08), 1)
    frequency_hz = round(50.0 + random.gauss(0, 0.05), 3)
    renewable_pct = round(random.uniform(25, 42), 1)

    return {
        "type": "grid_update",
        "timestamp": now.isoformat(),
        "metrics": {
            "grid_efficiency": round(random.uniform(92, 97.5), 2),
            "demand_mw": demand_mw,
            "supply_mw": supply_mw,
            "frequency_hz": frequency_hz,
            "total_nodes": total_nodes,
            "active_nodes": active,
            "renewable_percent": renewable_pct,
            "carbon_intensity_gco2_kwh": round(random.uniform(380, 520), 1),
            "grid_losses_percent": round(random.uniform(5, 12), 2),
            "peak_demand_mw": round(demand_mw * random.uniform(1.05, 1.2), 1),
            "transformer_avg_health": round(random.uniform(78, 95), 1),
            "active_alerts": random.randint(2, 15),
        },
        "zone_loads": {
            "north_delhi": round(demand_mw * random.uniform(0.15, 0.22), 1),
            "south_delhi": round(demand_mw * random.uniform(0.18, 0.25), 1),
            "east_delhi": round(demand_mw * random.uniform(0.12, 0.18), 1),
            "west_delhi": round(demand_mw * random.uniform(0.14, 0.20), 1),
            "central_delhi": round(demand_mw * random.uniform(0.10, 0.16), 1),
            "new_delhi_district": round(demand_mw * random.uniform(0.08, 0.14), 1),
        },
    }


def _generate_alert() -> dict:
    """Generate a single random alert."""
    alert_template = random.choice(_ALERT_TYPES)
    alert_type, severity, msg_template = alert_template
    loc = random.choice(_LOCATIONS)

    message = msg_template.format(
        loc=loc,
        score=random.uniform(0.6, 0.99),
        load=random.randint(85, 110),
        nodes=random.randint(3, 45),
        dev=round(random.uniform(3, 15), 1),
        drop=random.randint(20, 60),
        spike=round(random.uniform(50, 300), 1),
    )

    return {
        "type": "alert",
        "id": f"WS-ALERT-{random.randint(10000, 99999)}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "alert_type": alert_type,
        "severity": severity,
        "location": loc,
        "message": message,
        "acknowledged": False,
        "auto_resolved": random.random() < 0.2,
    }


# ---------------------------------------------------------------------------
# WebSocket Endpoints
# ---------------------------------------------------------------------------


@router.websocket("/ws/grid-updates")
async def ws_grid_updates(websocket: WebSocket) -> None:
    """
    WebSocket endpoint that pushes live grid metric snapshots every 3 seconds.

    The client receives a JSON object on each tick containing:
    - Overall grid metrics (efficiency, demand, supply, frequency, …)
    - Per-zone load distribution
    - Active alert count

    Connection is maintained until the client disconnects.
    """
    await websocket.accept()
    try:
        while True:
            data = _generate_grid_update()
            await websocket.send_json(data)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass  # Client disconnected gracefully
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass


@router.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket) -> None:
    """
    WebSocket endpoint that pushes random grid alerts at varying intervals.

    Alerts are generated every 5-15 seconds to simulate real-time
    operational events (theft detection, overloads, outages, etc.).

    Each alert includes type, severity, location, and a human-readable
    message.  The client can use severity to colour-code or prioritise
    the alert in the UI.
    """
    await websocket.accept()
    try:
        while True:
            alert = _generate_alert()
            await websocket.send_json(alert)
            # Variable interval: 5-15 seconds
            await asyncio.sleep(random.uniform(5, 15))
    except WebSocketDisconnect:
        pass  # Client disconnected gracefully
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass
