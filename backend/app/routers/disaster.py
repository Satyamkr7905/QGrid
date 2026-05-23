"""
Disaster Resilience Router - Q-Grid Shield
Provides resilience scoring, disaster simulation, and critical infrastructure
prioritization for emergency preparedness planning.
"""

import random
from datetime import datetime, timezone
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class DisasterType(str, Enum):
    storm = "storm"
    flood = "flood"
    earthquake = "earthquake"
    cyberattack = "cyberattack"


class CategoryScore(BaseModel):
    category: str
    score: float = Field(..., ge=0, le=100)
    weight: float
    description: str
    improvement_suggestions: list[str]


class ResilienceScoreResponse(BaseModel):
    overall_score: float = Field(..., ge=0, le=100)
    grade: str  # A, B, C, D, F
    breakdown: list[CategoryScore]
    trend: str  # improving | stable | declining
    last_assessment: str
    timestamp: str


class SimulationRequest(BaseModel):
    disaster_type: DisasterType
    intensity: int = Field(..., ge=1, le=10)
    affected_area: str = Field(..., description="Area name or zone identifier")


class AffectedNode(BaseModel):
    id: str
    name: str
    type: str
    damage_level: str  # none | minor | moderate | severe | destroyed
    estimated_repair_hours: int
    priority: int


class ReroutedPath(BaseModel):
    original_path: list[str]
    new_path: list[str]
    power_mw: float
    latency_increase_ms: float


class ImpactAssessment(BaseModel):
    severity: str  # low | moderate | severe | catastrophic
    population_affected: int
    area_sq_km: float
    estimated_outage_duration_hours: float
    economic_impact_inr_crores: float
    critical_facilities_at_risk: int


class SimulationResponse(BaseModel):
    disaster_type: str
    intensity: int
    affected_area: str
    impact_assessment: ImpactAssessment
    affected_nodes: list[AffectedNode]
    rerouted_paths: list[ReroutedPath]
    estimated_recovery_time_hours: float
    recovery_phases: list[dict]
    grid_stability_post_event: float
    backup_power_coverage_percent: float
    recommendations: list[str]
    timestamp: str


class CriticalNode(BaseModel):
    id: str
    name: str
    type: str
    location: str
    lat: float
    lng: float
    criticality_score: float = Field(..., ge=0, le=100)
    connected_population: int
    backup_available: bool
    redundancy_level: int = Field(..., ge=0, le=3, description="0=none, 3=full")
    vulnerability: str  # low | medium | high
    critical_facilities_served: list[str]


class CriticalNodesResponse(BaseModel):
    nodes: list[CriticalNode]
    total: int
    high_risk_count: int
    timestamp: str


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

_CENTER_LAT = 12.9716
_CENTER_LNG = 77.5946

_AREAS = [
    "Central Delhi", "South Delhi", "North Delhi", "East Delhi",
    "West Delhi", "Bangalore District", "Shahdara Zone",
    "Dwarka Zone", "Rohini Zone", "Mehrauli Zone",
]

_CRITICAL_FACILITIES = [
    "AIIMS Hospital", "Safdarjung Hospital", "Delhi Metro Control",
    "IGI Airport", "Railway Command Centre", "Water Treatment Plant",
    "Telecom Hub", "Fire Station", "Police HQ", "Emergency Shelter",
    "Blood Bank", "Power Grid Control Room", "Data Centre",
]

_NODE_TYPES = ["substation", "transformer", "generator", "control_centre", "distribution_hub"]

_NODE_NAMES = [
    "Pragati 220kV Substation", "Mehrauli Control Hub", "NDMC Grid Centre",
    "Rohini Distribution Hub", "Dwarka 400kV Substation", "IP Extension 132kV",
    "Wazirpur Emergency Hub", "Shahdara Control Room", "Rajghat Generator",
    "Narela Solar Hub", "Badarpur TPS", "Tughlakabad 220kV",
    "Okhla Distribution Hub", "Patel Nagar 33kV", "Karol Bagh 33kV",
    "Connaught Place Grid Hub", "Lajpat Nagar Substation", "Saket 66kV",
    "Model Town Hub", "Janakpuri 66kV", "Nehru Place Distribution",
    "Vasant Kunj Substation", "Greater Kailash Hub", "Hauz Khas 33kV",
    "Mayur Vihar Hub",
]

_IMPROVEMENT_SUGGESTIONS = {
    "infrastructure": [
        "Upgrade aging transmission towers in North Delhi zone",
        "Install surge protection on all 220kV substations",
        "Replace underground cables older than 20 years in flood zones",
    ],
    "redundancy": [
        "Add redundant feeder paths for single-point-of-failure substations",
        "Deploy mobile substations at pre-positioned staging areas",
        "Establish cross-zone power sharing agreements",
    ],
    "response_time": [
        "Implement AI-driven fault detection for sub-second response",
        "Pre-position repair crews in high-risk zones during monsoon",
        "Upgrade SCADA communication to 5G backbone",
    ],
    "backup_power": [
        "Install battery energy storage at critical substations",
        "Increase diesel generator reserves at hospitals and data centres",
        "Deploy solar + storage microgrids at emergency shelters",
    ],
}

_RECOMMENDATIONS = {
    DisasterType.storm: [
        "Pre-position repair crews in exposed zones before storm arrival",
        "Switch to underground feeders where available in high-wind corridors",
        "Activate battery reserves at critical facilities 2 hours before landfall",
        "Coordinate with municipal agencies for tree-fall clearance teams",
    ],
    DisasterType.flood: [
        "De-energize substations in flood-prone low-lying areas proactively",
        "Reroute power through elevated transmission corridors",
        "Deploy portable pumping systems at underground installations",
        "Pre-charge battery storage at hospitals and shelters to 100%",
    ],
    DisasterType.earthquake: [
        "Activate seismic-isolation mode on equipped transformers",
        "Dispatch structural inspection teams to all substations post-tremor",
        "Switch to island-mode for microgrids in severely affected zones",
        "Coordinate with gas utility for joint infrastructure assessment",
    ],
    DisasterType.cyberattack: [
        "Isolate affected SCADA segments and switch to manual control",
        "Activate backup communication channels (satellite / radio)",
        "Engage CERT-In and cybersecurity incident response team",
        "Reset all compromised credentials and rotate encryption keys",
    ],
}


def _jitter(center: float, spread: float = 0.1) -> float:
    return round(center + random.uniform(-spread, spread), 6)


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()


@router.get("/resilience-score", response_model=ResilienceScoreResponse)
async def get_resilience_score() -> ResilienceScoreResponse:
    """
    Return the overall grid resilience score (0-100) with a breakdown by
    category: infrastructure, redundancy, response_time, and backup_power.

    Each category includes improvement suggestions.
    """
    categories = [
        ("infrastructure", 0.30, "Physical infrastructure condition and hardening"),
        ("redundancy", 0.25, "Network redundancy and alternative routing capability"),
        ("response_time", 0.25, "Fault detection and crew dispatch speed"),
        ("backup_power", 0.20, "Battery storage, generators, and microgrid coverage"),
    ]

    breakdown: list[CategoryScore] = []
    weighted_total = 0.0

    for cat_name, weight, desc in categories:
        score = round(random.uniform(55, 92), 1)
        weighted_total += score * weight
        breakdown.append(
            CategoryScore(
                category=cat_name,
                score=score,
                weight=weight,
                description=desc,
                improvement_suggestions=_IMPROVEMENT_SUGGESTIONS[cat_name],
            )
        )

    overall = round(weighted_total, 1)
    grade = "A" if overall >= 85 else "B" if overall >= 70 else "C" if overall >= 55 else "D" if overall >= 40 else "F"

    return ResilienceScoreResponse(
        overall_score=overall,
        grade=grade,
        breakdown=breakdown,
        trend=random.choice(["improving", "stable", "declining"]),
        last_assessment=datetime.now(timezone.utc).isoformat(),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/simulate", response_model=SimulationResponse)
async def simulate_disaster(request: SimulationRequest) -> SimulationResponse:
    """
    Simulate a disaster scenario and return the projected impact assessment.

    Accepts disaster type (storm, flood, earthquake, cyberattack), intensity
    (1-10), and affected area.  Returns affected nodes, rerouted paths,
    recovery phases, and actionable recommendations.
    """
    intensity = request.intensity
    intensity_factor = intensity / 10.0

    # Impact assessment scaled by intensity
    population = int(random.uniform(50_000, 2_000_000) * intensity_factor)
    area_km2 = round(random.uniform(5, 150) * intensity_factor, 1)
    outage_hours = round(random.uniform(2, 72) * intensity_factor, 1)
    economic_impact = round(random.uniform(10, 500) * intensity_factor, 1)
    critical_at_risk = int(random.uniform(2, 20) * intensity_factor)

    severity = (
        "catastrophic" if intensity >= 9 else
        "severe" if intensity >= 7 else
        "moderate" if intensity >= 4 else
        "low"
    )

    impact = ImpactAssessment(
        severity=severity,
        population_affected=population,
        area_sq_km=area_km2,
        estimated_outage_duration_hours=outage_hours,
        economic_impact_inr_crores=economic_impact,
        critical_facilities_at_risk=critical_at_risk,
    )

    # Affected nodes
    num_affected = max(3, int(len(_NODE_NAMES) * intensity_factor * random.uniform(0.5, 0.9)))
    selected_names = random.sample(_NODE_NAMES, k=min(num_affected, len(_NODE_NAMES)))
    damage_levels = ["minor", "moderate", "severe", "destroyed"]
    affected_nodes: list[AffectedNode] = []

    for i, name in enumerate(selected_names):
        damage_idx = min(len(damage_levels) - 1, int(intensity_factor * random.uniform(0.5, 1.5) * 3))
        affected_nodes.append(
            AffectedNode(
                id=f"NODE-{i+1:03d}",
                name=name,
                type=random.choice(_NODE_TYPES),
                damage_level=damage_levels[damage_idx],
                estimated_repair_hours=random.randint(2, int(96 * intensity_factor) + 4),
                priority=random.randint(1, 5),
            )
        )

    affected_nodes.sort(key=lambda n: n.priority)

    # Rerouted paths
    rerouted: list[ReroutedPath] = []
    for _ in range(random.randint(3, 8)):
        path_len = random.randint(2, 4)
        original = random.sample(_NODE_NAMES, k=path_len)
        new = random.sample(_NODE_NAMES, k=path_len + 1)
        rerouted.append(
            ReroutedPath(
                original_path=original,
                new_path=new,
                power_mw=round(random.uniform(20, 200), 1),
                latency_increase_ms=round(random.uniform(2, 50) * intensity_factor, 1),
            )
        )

    # Recovery phases
    recovery_phases = [
        {
            "phase": 1,
            "name": "Emergency Stabilization",
            "duration_hours": round(random.uniform(1, 6) * intensity_factor, 1),
            "actions": ["Isolate damaged segments", "Activate backup generators", "Dispatch first responders"],
        },
        {
            "phase": 2,
            "name": "Critical Restoration",
            "duration_hours": round(random.uniform(4, 24) * intensity_factor, 1),
            "actions": ["Restore power to hospitals & shelters", "Repair primary feeders", "Deploy mobile substations"],
        },
        {
            "phase": 3,
            "name": "Progressive Recovery",
            "duration_hours": round(random.uniform(12, 72) * intensity_factor, 1),
            "actions": ["Restore residential areas", "Repair transformers", "Re-commission damaged nodes"],
        },
        {
            "phase": 4,
            "name": "Full Restoration",
            "duration_hours": round(random.uniform(24, 168) * intensity_factor, 1),
            "actions": ["Complete all repairs", "Post-event inspection", "Update resilience models"],
        },
    ]

    return SimulationResponse(
        disaster_type=request.disaster_type.value,
        intensity=intensity,
        affected_area=request.affected_area,
        impact_assessment=impact,
        affected_nodes=affected_nodes,
        rerouted_paths=rerouted,
        estimated_recovery_time_hours=round(sum(p["duration_hours"] for p in recovery_phases), 1),
        recovery_phases=recovery_phases,
        grid_stability_post_event=round(random.uniform(30, 85) * (1 - intensity_factor * 0.3), 1),
        backup_power_coverage_percent=round(random.uniform(40, 85), 1),
        recommendations=_RECOMMENDATIONS.get(request.disaster_type, []),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/critical-nodes", response_model=CriticalNodesResponse)
async def get_critical_nodes() -> CriticalNodesResponse:
    """
    Return a prioritized list of critical infrastructure nodes.

    Each node includes a criticality score, connected population, backup
    availability, redundancy level, and the critical facilities it serves.
    """
    nodes: list[CriticalNode] = []

    for i, name in enumerate(_NODE_NAMES):
        criticality = round(random.uniform(40, 100), 1)
        redundancy = random.randint(0, 3)
        has_backup = random.random() < 0.6
        vulnerability = (
            "high" if criticality > 80 and redundancy < 2 else
            "medium" if criticality > 60 else
            "low"
        )

        num_facilities = random.randint(1, 4)
        facilities = random.sample(_CRITICAL_FACILITIES, k=min(num_facilities, len(_CRITICAL_FACILITIES)))

        nodes.append(
            CriticalNode(
                id=f"CRIT-{i+1:03d}",
                name=name,
                type=random.choice(_NODE_TYPES),
                location=random.choice(_AREAS),
                lat=_jitter(_CENTER_LAT),
                lng=_jitter(_CENTER_LNG),
                criticality_score=criticality,
                connected_population=random.randint(5_000, 500_000),
                backup_available=has_backup,
                redundancy_level=redundancy,
                vulnerability=vulnerability,
                critical_facilities_served=facilities,
            )
        )

    nodes.sort(key=lambda n: n.criticality_score, reverse=True)
    high_risk = sum(1 for n in nodes if n.vulnerability == "high")

    return CriticalNodesResponse(
        nodes=nodes,
        total=len(nodes),
        high_risk_count=high_risk,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
