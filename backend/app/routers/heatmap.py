"""
Heatmap Router - Q-Grid Shield
Provides geospatial grid-node data and heatmap layer intensities for the
smart-city map view (overload, outage-risk, theft, renewable layers).
"""

import random
from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class NodeType(str, Enum):
    substation = "substation"
    transformer = "transformer"
    meter = "meter"
    renewable = "renewable"


class NodeStatus(str, Enum):
    online = "online"
    offline = "offline"
    warning = "warning"
    maintenance = "maintenance"


class GridNode(BaseModel):
    """Represents a single node on the grid map."""

    id: str
    name: str
    lat: float
    lng: float
    type: NodeType
    status: NodeStatus
    load_percentage: float = Field(..., ge=0, le=100)
    voltage_kv: float
    last_updated: str


class GridNodesResponse(BaseModel):
    nodes: list[GridNode]
    total: int
    timestamp: str


class HeatmapPoint(BaseModel):
    """A single point for a heatmap layer."""

    lat: float
    lng: float
    intensity: float = Field(..., ge=0, le=1.0)
    radius: float = Field(..., description="Radius in meters")


class HeatmapLayerResponse(BaseModel):
    layer_type: str
    points: list[HeatmapPoint]
    total: int
    timestamp: str


# ---------------------------------------------------------------------------
# Static seed data for consistent node names
# ---------------------------------------------------------------------------

_CITY_CENTER_LAT = 12.9716
_CITY_CENTER_LNG = 77.5946

_SUBSTATION_NAMES = [
    "Pragati Maidan 220kV", "Mehrauli 132kV", "Rohini Sec-3 220kV",
    "Narela 400kV", "Dwarka Sec-8 220kV", "IP Station 132kV",
    "Okhla 132kV", "Wazirpur 220kV", "Shahdara 132kV", "Tughlakabad 220kV",
]

_TRANSFORMER_NAMES = [
    "TR-Karol Bagh 11kV", "TR-Lajpat Nagar 11kV", "TR-Saket 33kV",
    "TR-Pitampura 11kV", "TR-Janakpuri 33kV", "TR-Vasant Kunj 11kV",
    "TR-Mayur Vihar 11kV", "TR-Nehru Place 33kV", "TR-Patel Nagar 11kV",
    "TR-Rajouri Garden 11kV", "TR-Model Town 33kV", "TR-Paschim Vihar 11kV",
    "TR-Kalkaji 11kV", "TR-Greater Kailash 33kV", "TR-Hauz Khas 11kV",
]

_METER_PREFIXES = [
    "SM-Connaught Place", "SM-Green Park", "SM-Chandni Chowk",
    "SM-Defence Colony", "SM-Sarita Vihar", "SM-Dilshad Garden",
    "SM-Ashok Vihar", "SM-Moti Bagh", "SM-East of Kailash",
    "SM-Malviya Nagar", "SM-Lado Sarai", "SM-Panchsheel Park",
    "SM-Kirti Nagar", "SM-Tilak Nagar", "SM-Uttam Nagar",
    "SM-Vikaspuri", "SM-Hari Nagar", "SM-Punjabi Bagh",
    "SM-Preet Vihar", "SM-Laxmi Nagar",
]

_RENEWABLE_NAMES = [
    "Solar Park Dwarka Ph-II", "Solar Rooftop NDMC-1", "Wind Turbine Narela",
    "Solar Park Badarpur", "Micro-Wind Rohini", "Solar Carport Saket",
    "Floating Solar Sanjay Lake", "Bio-Gas Plant Okhla",
]

_VALID_LAYERS = {"overload", "outage_risk", "theft", "renewable"}


def _jitter(center: float, spread: float = 0.08) -> float:
    """Return a value near *center* with uniform jitter."""
    return round(center + random.uniform(-spread, spread), 6)


def _build_nodes() -> list[GridNode]:
    """Generate a deterministic-ish set of grid nodes around Bangalore."""
    nodes: list[GridNode] = []
    node_id = 1

    statuses_weighted = [NodeStatus.online] * 15 + [NodeStatus.warning] * 3 + [
        NodeStatus.maintenance
    ] + [NodeStatus.offline]

    # Substations
    for name in _SUBSTATION_NAMES:
        nodes.append(
            GridNode(
                id=f"SUB-{node_id:04d}",
                name=name,
                lat=_jitter(_CITY_CENTER_LAT, 0.12),
                lng=_jitter(_CITY_CENTER_LNG, 0.12),
                type=NodeType.substation,
                status=random.choice(statuses_weighted),
                load_percentage=round(random.uniform(40, 92), 1),
                voltage_kv=round(random.choice([132, 220, 400]) + random.uniform(-2, 2), 1),
                last_updated=datetime.now(timezone.utc).isoformat(),
            )
        )
        node_id += 1

    # Transformers
    for name in _TRANSFORMER_NAMES:
        nodes.append(
            GridNode(
                id=f"TRF-{node_id:04d}",
                name=name,
                lat=_jitter(_CITY_CENTER_LAT, 0.09),
                lng=_jitter(_CITY_CENTER_LNG, 0.09),
                type=NodeType.transformer,
                status=random.choice(statuses_weighted),
                load_percentage=round(random.uniform(30, 98), 1),
                voltage_kv=round(random.choice([11, 33]) + random.uniform(-0.5, 0.5), 1),
                last_updated=datetime.now(timezone.utc).isoformat(),
            )
        )
        node_id += 1

    # Smart meters
    for prefix in _METER_PREFIXES:
        for j in range(1, random.randint(3, 6)):
            nodes.append(
                GridNode(
                    id=f"MTR-{node_id:04d}",
                    name=f"{prefix}-{j:02d}",
                    lat=_jitter(_CITY_CENTER_LAT, 0.07),
                    lng=_jitter(_CITY_CENTER_LNG, 0.07),
                    type=NodeType.meter,
                    status=random.choice(statuses_weighted),
                    load_percentage=round(random.uniform(10, 85), 1),
                    voltage_kv=round(0.4 + random.uniform(-0.02, 0.02), 3),
                    last_updated=datetime.now(timezone.utc).isoformat(),
                )
            )
            node_id += 1

    # Renewables
    for name in _RENEWABLE_NAMES:
        nodes.append(
            GridNode(
                id=f"REN-{node_id:04d}",
                name=name,
                lat=_jitter(_CITY_CENTER_LAT, 0.14),
                lng=_jitter(_CITY_CENTER_LNG, 0.14),
                type=NodeType.renewable,
                status=random.choice([NodeStatus.online, NodeStatus.online, NodeStatus.warning]),
                load_percentage=round(random.uniform(15, 75), 1),
                voltage_kv=round(random.choice([11, 33]) + random.uniform(-0.3, 0.3), 1),
                last_updated=datetime.now(timezone.utc).isoformat(),
            )
        )
        node_id += 1

    return nodes


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()


@router.get("/nodes", response_model=GridNodesResponse)
async def get_grid_nodes(
    node_type: NodeType | None = Query(default=None, description="Filter by node type"),
    status: NodeStatus | None = Query(default=None, description="Filter by status"),
) -> GridNodesResponse:
    """
    Return all grid nodes with geospatial coordinates, type, status, and load.

    Optionally filter by **node_type** and/or **status**.  Each call
    regenerates slightly randomised telemetry to simulate live data.
    """
    all_nodes = _build_nodes()

    if node_type is not None:
        all_nodes = [n for n in all_nodes if n.type == node_type]
    if status is not None:
        all_nodes = [n for n in all_nodes if n.status == status]

    return GridNodesResponse(
        nodes=all_nodes,
        total=len(all_nodes),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/layers/{layer_type}", response_model=HeatmapLayerResponse)
async def get_heatmap_layer(
    layer_type: str = Path(..., description="One of: overload, outage_risk, theft, renewable"),
) -> HeatmapLayerResponse:
    """
    Return a heatmap layer of the specified type.

    Supported layer types:
    - **overload** – areas with high load / congestion risk
    - **outage_risk** – predicted outage probability zones
    - **theft** – detected / suspected energy theft hotspots
    - **renewable** – renewable energy generation density

    Each layer returns an array of {lat, lng, intensity, radius} points
    suitable for rendering with Leaflet / Mapbox heatmap plugins.
    """
    if layer_type not in _VALID_LAYERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid layer type '{layer_type}'. Choose from: {', '.join(sorted(_VALID_LAYERS))}",
        )

    # Layer-specific generation parameters
    config = {
        "overload": {"count": (40, 70), "intensity_range": (0.4, 1.0), "radius": (200, 600)},
        "outage_risk": {"count": (25, 50), "intensity_range": (0.2, 0.9), "radius": (300, 900)},
        "theft": {"count": (15, 35), "intensity_range": (0.5, 1.0), "radius": (100, 400)},
        "renewable": {"count": (20, 40), "intensity_range": (0.3, 0.95), "radius": (250, 800)},
    }

    cfg = config[layer_type]
    num_points = random.randint(*cfg["count"])
    points: list[HeatmapPoint] = []

    for _ in range(num_points):
        points.append(
            HeatmapPoint(
                lat=_jitter(_CITY_CENTER_LAT, 0.12),
                lng=_jitter(_CITY_CENTER_LNG, 0.12),
                intensity=round(random.uniform(*cfg["intensity_range"]), 3),
                radius=round(random.uniform(*cfg["radius"]), 0),
            )
        )

    return HeatmapLayerResponse(
        layer_type=layer_type,
        points=points,
        total=len(points),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
