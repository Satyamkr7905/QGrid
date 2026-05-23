"""
Dashboard Router - Q-Grid Shield
Provides overview metrics, energy routing paths, and historical time-series data
for the main dashboard view.
"""

import random
import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Response Models
# ---------------------------------------------------------------------------


class DashboardOverview(BaseModel):
    """Aggregated KPI snapshot for the grid."""

    grid_efficiency: float = Field(..., description="Overall grid efficiency percentage")
    active_theft_alerts: int = Field(..., description="Number of active theft alerts")
    transformer_health_score: float = Field(..., description="Average transformer health 0-100")
    renewable_energy_percent: float = Field(..., description="Renewable share of total generation")
    carbon_reduction_tons: float = Field(..., description="CO₂ reduction in metric tons (MTD)")
    total_nodes: int = Field(..., description="Total grid nodes")
    active_nodes: int = Field(..., description="Currently active/online nodes")
    peak_demand_mw: float = Field(..., description="Peak demand in MW today")
    current_load_mw: float = Field(..., description="Current load in MW")
    timestamp: str


class EnergyRoutingPath(BaseModel):
    """A single energy routing path between two grid nodes."""

    id: str
    source: str
    destination: str
    power_flow_mw: float = Field(..., description="Power flowing in MW")
    max_capacity_mw: float
    utilization_percent: float
    status: str = Field(..., description="active | congested | standby | rerouted")
    priority: int = Field(..., ge=1, le=5)


class EnergyRoutingResponse(BaseModel):
    paths: list[EnergyRoutingPath]
    total_power_flow_mw: float
    timestamp: str


class MetricPoint(BaseModel):
    """A single data point in a time-series."""

    timestamp: str
    value: float


class MetricsHistoryResponse(BaseModel):
    efficiency: list[MetricPoint]
    demand: list[MetricPoint]
    supply: list[MetricPoint]
    period_hours: int


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()

# Deterministic seed-friendly helpers ----------------------------------------

_SOURCES = [
    "Pragati Power Station",
    "Badarpur TPS",
    "Solar Farm Dwarka",
    "Wind Park Gurgaon",
    "Rithala Substation",
    "NDMC Grid Hub",
    "Rajghat Power House",
    "Indraprastha Substation",
    "Narela Solar Park",
    "Tughlakabad Substation",
]

_DESTINATIONS = [
    "Connaught Place Zone",
    "Saket Distribution Hub",
    "Rohini Sector 22 Feeder",
    "Dwarka Sec 21 Feeder",
    "Karol Bagh Transformer",
    "Lajpat Nagar Grid",
    "Mayur Vihar Phase III",
    "Nehru Place Substation",
    "Janakpuri West Hub",
    "Vasant Kunj Feeder",
]

_ROUTE_STATUSES = ["active", "active", "active", "active", "congested", "standby", "rerouted"]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview() -> DashboardOverview:
    """
    Return a real-time snapshot of key grid KPIs.

    The data refreshes on every call with small random perturbations to
    simulate live telemetry.
    """
    total_nodes = 1_247
    active_nodes = total_nodes - random.randint(3, 28)
    peak_demand = round(random.uniform(4800, 5400), 1)
    current_load = round(peak_demand * random.uniform(0.62, 0.88), 1)

    return DashboardOverview(
        grid_efficiency=round(random.uniform(92.0, 97.5), 2),
        active_theft_alerts=random.randint(3, 18),
        transformer_health_score=round(random.uniform(78.0, 95.0), 1),
        renewable_energy_percent=round(random.uniform(28.0, 42.0), 1),
        carbon_reduction_tons=round(random.uniform(1200, 2800), 1),
        total_nodes=total_nodes,
        active_nodes=active_nodes,
        peak_demand_mw=peak_demand,
        current_load_mw=current_load,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/energy-routing", response_model=EnergyRoutingResponse)
async def get_energy_routing() -> EnergyRoutingResponse:
    """
    Return current energy routing paths across the grid.

    Each path represents a power-flow corridor between a generation source
    and a distribution destination, including utilization and status.
    """
    paths: list[EnergyRoutingPath] = []
    used_pairs: set[tuple[str, str]] = set()

    num_paths = random.randint(8, 14)
    for i in range(num_paths):
        while True:
            src = random.choice(_SOURCES)
            dst = random.choice(_DESTINATIONS)
            if (src, dst) not in used_pairs:
                used_pairs.add((src, dst))
                break

        max_cap = round(random.uniform(150, 800), 1)
        utilization = round(random.uniform(35, 98), 1)
        power_flow = round(max_cap * utilization / 100, 1)
        status = "congested" if utilization > 90 else random.choice(_ROUTE_STATUSES)

        paths.append(
            EnergyRoutingPath(
                id=f"ER-{i+1:04d}",
                source=src,
                destination=dst,
                power_flow_mw=power_flow,
                max_capacity_mw=max_cap,
                utilization_percent=utilization,
                status=status,
                priority=random.randint(1, 5),
            )
        )

    total_flow = round(sum(p.power_flow_mw for p in paths), 1)

    return EnergyRoutingResponse(
        paths=paths,
        total_power_flow_mw=total_flow,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/metrics-history", response_model=MetricsHistoryResponse)
async def get_metrics_history(
    hours: int = Query(default=24, ge=1, le=168, description="Look-back window in hours"),
) -> MetricsHistoryResponse:
    """
    Return time-series data for grid efficiency, demand, and supply.

    Data points are generated at 15-minute intervals for the requested
    look-back window (default 24 hours).  Sinusoidal patterns model the
    daily demand cycle with added Gaussian noise.
    """
    now = datetime.now(timezone.utc)
    interval_minutes = 15
    num_points = (hours * 60) // interval_minutes

    efficiency_points: list[MetricPoint] = []
    demand_points: list[MetricPoint] = []
    supply_points: list[MetricPoint] = []

    for i in range(num_points):
        ts = now - timedelta(minutes=(num_points - i) * interval_minutes)
        ts_str = ts.isoformat()

        # Hour-of-day for realistic daily curve
        hour_frac = ts.hour + ts.minute / 60.0

        # Demand: peaks at ~14:00, trough at ~04:00
        base_demand = 3200 + 1400 * math.sin(math.pi * (hour_frac - 4) / 12)
        demand = round(max(2000, base_demand + random.gauss(0, 120)), 1)

        # Supply slightly above demand
        supply = round(demand * random.uniform(1.02, 1.10), 1)

        # Efficiency correlated to load balance
        eff = round(min(99.5, 88 + 8 * (supply - demand) / supply * 100 + random.gauss(0, 0.5)), 2)

        efficiency_points.append(MetricPoint(timestamp=ts_str, value=eff))
        demand_points.append(MetricPoint(timestamp=ts_str, value=demand))
        supply_points.append(MetricPoint(timestamp=ts_str, value=supply))

    return MetricsHistoryResponse(
        efficiency=efficiency_points,
        demand=demand_points,
        supply=supply_points,
        period_hours=hours,
    )
