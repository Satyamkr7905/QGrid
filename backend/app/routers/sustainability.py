"""
Sustainability Router - Q-Grid Shield
Provides CO₂ reduction tracking, renewable energy analytics, SDG goal
contributions, and sustainability KPIs.
"""

import random
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class SustainabilityMetrics(BaseModel):
    """Aggregated sustainability KPIs."""

    co2_reduction_tons: float = Field(..., description="CO₂ reduced (MTD) in metric tons")
    co2_reduction_year_tons: float = Field(..., description="CO₂ reduced (YTD) in metric tons")
    energy_waste_reduction_percent: float
    renewable_percentage: float
    tree_equivalent: int = Field(..., description="Equivalent number of trees planted")
    total_savings_inr: float = Field(..., description="Cost savings in INR")
    total_savings_mwh: float = Field(..., description="Energy saved in MWh")
    grid_loss_reduction_percent: float
    timestamp: str


class CO2MonthlyPoint(BaseModel):
    month: str  # "2026-01", "2026-02", ...
    co2_reduction_tons: float
    target_tons: float
    renewable_generation_mwh: float


class CO2HistoryResponse(BaseModel):
    data: list[CO2MonthlyPoint]
    total_reduction_tons: float
    average_monthly_tons: float
    on_track: bool
    timestamp: str


class SDGGoal(BaseModel):
    sdg_number: int
    title: str
    description: str
    progress_percent: float = Field(..., ge=0, le=100)
    target_year: int
    key_indicators: list[dict]
    status: str  # on_track | needs_attention | behind


class SDGResponse(BaseModel):
    goals: list[SDGGoal]
    overall_progress_percent: float
    timestamp: str


class RenewableSource(BaseModel):
    source: str  # solar | wind | hydro | biomass
    generation_mwh: float
    capacity_mw: float
    utilization_percent: float
    share_percent: float
    trend: str  # up | stable | down
    growth_yoy_percent: float
    carbon_offset_tons: float


class RenewableBreakdownResponse(BaseModel):
    sources: list[RenewableSource]
    total_renewable_mwh: float
    total_capacity_mw: float
    overall_renewable_percent: float
    timestamp: str


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter()


@router.get("/metrics", response_model=SustainabilityMetrics)
async def get_sustainability_metrics() -> SustainabilityMetrics:
    """
    Return aggregated sustainability KPIs including CO₂ reduction,
    renewable energy share, energy waste reduction, tree equivalence,
    and cost savings.
    """
    co2_mtd = round(random.uniform(1200, 2800), 1)
    co2_ytd = round(co2_mtd * random.uniform(4.5, 6.5), 1)
    renewable_pct = round(random.uniform(28, 42), 1)
    waste_reduction = round(random.uniform(12, 28), 1)
    savings_mwh = round(random.uniform(3500, 8500), 1)

    return SustainabilityMetrics(
        co2_reduction_tons=co2_mtd,
        co2_reduction_year_tons=co2_ytd,
        energy_waste_reduction_percent=waste_reduction,
        renewable_percentage=renewable_pct,
        tree_equivalent=int(co2_ytd * 45),  # ~45 trees per ton CO₂/yr
        total_savings_inr=round(savings_mwh * random.uniform(4500, 6200), -3),
        total_savings_mwh=savings_mwh,
        grid_loss_reduction_percent=round(random.uniform(2.5, 7.8), 1),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/co2-history", response_model=CO2HistoryResponse)
async def get_co2_history() -> CO2HistoryResponse:
    """
    Return monthly CO₂ reduction data for the current year.

    Each data point includes actual reduction, target, and renewable
    generation figures.  The `on_track` flag indicates whether the
    cumulative reduction meets or exceeds the cumulative target.
    """
    months = [
        "2026-01", "2026-02", "2026-03", "2026-04", "2026-05",
    ]
    data: list[CO2MonthlyPoint] = []
    cumulative_actual = 0.0
    cumulative_target = 0.0

    for i, month in enumerate(months):
        # Seasonal pattern: higher in summer (more solar)
        season_factor = 1.0 + 0.15 * (i / len(months))
        target = round(random.uniform(1800, 2400) * season_factor, 1)
        actual = round(target * random.uniform(0.88, 1.15), 1)
        renewable = round(random.uniform(8000, 15000) * season_factor, 1)

        cumulative_actual += actual
        cumulative_target += target

        data.append(
            CO2MonthlyPoint(
                month=month,
                co2_reduction_tons=actual,
                target_tons=target,
                renewable_generation_mwh=renewable,
            )
        )

    total = round(sum(d.co2_reduction_tons for d in data), 1)
    avg = round(total / len(data), 1)

    return CO2HistoryResponse(
        data=data,
        total_reduction_tons=total,
        average_monthly_tons=avg,
        on_track=cumulative_actual >= cumulative_target * 0.95,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/sdg", response_model=SDGResponse)
async def get_sdg_contributions() -> SDGResponse:
    """
    Return the project's contribution towards UN Sustainable Development Goals.

    Tracks SDG 7 (Affordable & Clean Energy), SDG 11 (Sustainable Cities),
    and SDG 13 (Climate Action) with progress percentages and key indicators.
    """
    goals = [
        SDGGoal(
            sdg_number=7,
            title="Affordable and Clean Energy",
            description="Ensure access to affordable, reliable, sustainable and modern energy for all",
            progress_percent=round(random.uniform(62, 78), 1),
            target_year=2030,
            key_indicators=[
                {"indicator": "Renewable energy share", "value": f"{round(random.uniform(28, 42), 1)}%", "target": "50%"},
                {"indicator": "Energy efficiency improvement", "value": f"{round(random.uniform(12, 22), 1)}%", "target": "30%"},
                {"indicator": "Grid reliability index", "value": f"{round(random.uniform(94, 99), 1)}%", "target": "99.5%"},
                {"indicator": "Access to electricity", "value": "99.8%", "target": "100%"},
            ],
            status="on_track",
        ),
        SDGGoal(
            sdg_number=11,
            title="Sustainable Cities and Communities",
            description="Make cities and human settlements inclusive, safe, resilient and sustainable",
            progress_percent=round(random.uniform(55, 72), 1),
            target_year=2030,
            key_indicators=[
                {"indicator": "Smart grid coverage", "value": f"{round(random.uniform(65, 82), 1)}%", "target": "95%"},
                {"indicator": "EV charging infrastructure", "value": f"{random.randint(180, 350)} stations", "target": "500 stations"},
                {"indicator": "Grid resilience score", "value": f"{round(random.uniform(72, 88), 1)}/100", "target": "90/100"},
                {"indicator": "Outage response time", "value": f"{random.randint(8, 25)} min", "target": "5 min"},
            ],
            status="needs_attention" if random.random() < 0.4 else "on_track",
        ),
        SDGGoal(
            sdg_number=13,
            title="Climate Action",
            description="Take urgent action to combat climate change and its impacts",
            progress_percent=round(random.uniform(48, 68), 1),
            target_year=2030,
            key_indicators=[
                {"indicator": "CO₂ reduction (annual)", "value": f"{round(random.uniform(8000, 14000), 0)} tons", "target": "20,000 tons"},
                {"indicator": "Fossil fuel dependency reduction", "value": f"{round(random.uniform(15, 30), 1)}%", "target": "50%"},
                {"indicator": "Grid losses reduction", "value": f"{round(random.uniform(3, 8), 1)}%", "target": "12%"},
                {"indicator": "Carbon intensity (gCO₂/kWh)", "value": f"{round(random.uniform(380, 520), 0)}", "target": "250"},
            ],
            status="behind" if random.random() < 0.3 else "needs_attention",
        ),
    ]

    overall = round(sum(g.progress_percent for g in goals) / len(goals), 1)

    return SDGResponse(
        goals=goals,
        overall_progress_percent=overall,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/renewable-breakdown", response_model=RenewableBreakdownResponse)
async def get_renewable_breakdown() -> RenewableBreakdownResponse:
    """
    Return a breakdown of renewable energy generation by source type
    (solar, wind, hydro, biomass) including capacity, utilization,
    share, and year-over-year growth.
    """
    solar_gen = round(random.uniform(4000, 7500), 1)
    wind_gen = round(random.uniform(2000, 4500), 1)
    hydro_gen = round(random.uniform(1500, 3500), 1)
    biomass_gen = round(random.uniform(500, 1500), 1)
    total_renewable = solar_gen + wind_gen + hydro_gen + biomass_gen

    # Total grid generation (for calculating overall %)
    total_grid = round(total_renewable / random.uniform(0.28, 0.42), 1)

    sources = [
        RenewableSource(
            source="solar",
            generation_mwh=solar_gen,
            capacity_mw=round(solar_gen / random.uniform(120, 180), 1),
            utilization_percent=round(random.uniform(18, 28), 1),
            share_percent=round(solar_gen / total_renewable * 100, 1),
            trend="up",
            growth_yoy_percent=round(random.uniform(12, 35), 1),
            carbon_offset_tons=round(solar_gen * 0.42, 1),
        ),
        RenewableSource(
            source="wind",
            generation_mwh=wind_gen,
            capacity_mw=round(wind_gen / random.uniform(100, 160), 1),
            utilization_percent=round(random.uniform(22, 38), 1),
            share_percent=round(wind_gen / total_renewable * 100, 1),
            trend="up" if random.random() < 0.7 else "stable",
            growth_yoy_percent=round(random.uniform(5, 20), 1),
            carbon_offset_tons=round(wind_gen * 0.42, 1),
        ),
        RenewableSource(
            source="hydro",
            generation_mwh=hydro_gen,
            capacity_mw=round(hydro_gen / random.uniform(200, 350), 1),
            utilization_percent=round(random.uniform(35, 55), 1),
            share_percent=round(hydro_gen / total_renewable * 100, 1),
            trend="stable",
            growth_yoy_percent=round(random.uniform(1, 8), 1),
            carbon_offset_tons=round(hydro_gen * 0.42, 1),
        ),
        RenewableSource(
            source="biomass",
            generation_mwh=biomass_gen,
            capacity_mw=round(biomass_gen / random.uniform(150, 250), 1),
            utilization_percent=round(random.uniform(40, 65), 1),
            share_percent=round(biomass_gen / total_renewable * 100, 1),
            trend="stable" if random.random() < 0.6 else "down",
            growth_yoy_percent=round(random.uniform(-2, 10), 1),
            carbon_offset_tons=round(biomass_gen * 0.32, 1),
        ),
    ]

    return RenewableBreakdownResponse(
        sources=sources,
        total_renewable_mwh=round(total_renewable, 1),
        total_capacity_mw=round(sum(s.capacity_mw for s in sources), 1),
        overall_renewable_percent=round(total_renewable / total_grid * 100, 1),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
