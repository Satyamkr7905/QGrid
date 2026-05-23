// Q-Grid Shield — Mock Data Generators
import type {
  DashboardMetrics, EnergyRoute, TheftAlert, SmartMeter,
  Transformer, GridNode, GridEdge, Notification,
  SustainabilityMetrics, SDGContribution,
} from '@/types/grid';

// ══════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════
export const dashboardMetrics: DashboardMetrics = {
  grid_efficiency: 94.7,
  active_theft_alerts: 12,
  transformer_health: 87.3,
  renewable_percentage: 38.6,
  carbon_reduction_tons: 2847,
  total_nodes: 1248,
  active_nodes: 1231,
  total_demand_mw: 4520,
  total_supply_mw: 4780,
};

export const energyRoutes: EnergyRoute[] = [
  { id: "ER-001", source: "Solar Farm Alpha", destination: "Substation North", power_flow_mw: 120, status: "active", efficiency: 96.2 },
  { id: "ER-002", source: "Wind Park Beta", destination: "Substation East", power_flow_mw: 85, status: "active", efficiency: 94.8 },
  { id: "ER-003", source: "Hydro Plant Gamma", destination: "Substation Central", power_flow_mw: 200, status: "active", efficiency: 98.1 },
  { id: "ER-004", source: "Grid Import", destination: "Substation South", power_flow_mw: 340, status: "congested", efficiency: 89.3 },
  { id: "ER-005", source: "Battery Storage", destination: "Substation West", power_flow_mw: 45, status: "active", efficiency: 97.5 },
  { id: "ER-006", source: "Biomass Unit", destination: "Substation North", power_flow_mw: 30, status: "active", efficiency: 91.6 },
];

export function generateTimeSeriesData(hours: number = 24) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const timestamp = new Date(now - (hours - i) * 3600000);
    const baseEfficiency = 92 + Math.sin(i / 4) * 3;
    const baseDemand = 4200 + Math.sin(i / 6) * 800 + Math.random() * 200;
    const baseSupply = baseDemand * (1 + Math.random() * 0.1);
    const renewable = 35 + Math.sin(i / 8) * 10 + Math.random() * 5;
    return {
      time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hour: `${String(timestamp.getHours()).padStart(2, '0')}:00`,
      efficiency: Math.round(baseEfficiency * 10) / 10,
      demand: Math.round(baseDemand),
      supply: Math.round(baseSupply),
      renewable: Math.round(renewable * 10) / 10,
      carbon: Math.round((baseSupply - baseDemand) * 0.4),
    };
  });
}

// ══════════════════════════════════════════════
// Theft Detection
// ══════════════════════════════════════════════
export const theftAlerts: TheftAlert[] = [
  { id: "TA-001", meter_id: "SM-4521", location: "Sector 7, Block C", timestamp: new Date(Date.now() - 120000).toISOString(), anomaly_score: 0.92, theft_probability: 0.88, type: "consumption_spike", status: "active", severity: "critical" },
  { id: "TA-002", meter_id: "SM-3187", location: "Sector 3, Block A", timestamp: new Date(Date.now() - 300000).toISOString(), anomaly_score: 0.85, theft_probability: 0.76, type: "meter_bypass", status: "investigating", severity: "high" },
  { id: "TA-003", meter_id: "SM-6734", location: "Sector 12, Block D", timestamp: new Date(Date.now() - 600000).toISOString(), anomaly_score: 0.78, theft_probability: 0.65, type: "phase_imbalance", status: "active", severity: "high" },
  { id: "TA-004", meter_id: "SM-2891", location: "Sector 5, Block B", timestamp: new Date(Date.now() - 900000).toISOString(), anomaly_score: 0.71, theft_probability: 0.58, type: "reverse_flow", status: "investigating", severity: "medium" },
  { id: "TA-005", meter_id: "SM-1456", location: "Sector 9, Block E", timestamp: new Date(Date.now() - 1200000).toISOString(), anomaly_score: 0.65, theft_probability: 0.45, type: "consumption_spike", status: "active", severity: "medium" },
  { id: "TA-006", meter_id: "SM-8923", location: "Sector 1, Block F", timestamp: new Date(Date.now() - 1500000).toISOString(), anomaly_score: 0.58, theft_probability: 0.35, type: "phase_imbalance", status: "resolved", severity: "low" },
];

export const smartMeters: SmartMeter[] = Array.from({ length: 30 }, (_, i) => ({
  id: `SM-${String(1000 + i * 347).slice(0, 4)}`,
  location: `Sector ${Math.floor(Math.random() * 15) + 1}, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}`,
  lat: 12.9716 + (Math.random() - 0.5) * 0.1,
  lng: 77.5946 + (Math.random() - 0.5) * 0.1,
  consumption_kwh: Math.round((150 + Math.random() * 500) * 10) / 10,
  anomaly_score: Math.round(Math.random() * 100) / 100,
  theft_probability: Math.round(Math.random() * 100) / 100,
  status: Math.random() > 0.85 ? 'confirmed_theft' : Math.random() > 0.7 ? 'suspicious' : 'normal',
  last_reading: new Date(Date.now() - Math.random() * 3600000).toISOString(),
}));

export function generateAnomalyData() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    normal: Math.round(200 + Math.sin(i / 4) * 80 + Math.random() * 30),
    anomalous: Math.round(Math.random() > 0.7 ? 350 + Math.random() * 200 : 200 + Math.sin(i / 4) * 80 + Math.random() * 30),
    threshold: 380,
  }));
}

// ══════════════════════════════════════════════
// Transformers
// ══════════════════════════════════════════════
export const transformers: Transformer[] = [
  { id: "TR-001", name: "Transformer Alpha-1", location: "Substation North", lat: 12.99, lng: 77.59, age_years: 12, health_score: 92, temperature_celsius: 65, load_percent: 72, vibration_level: 0.3, oil_quality: 0.95, status: "healthy", predicted_failure_date: "2028-06-15", risk_level: "low" },
  { id: "TR-002", name: "Transformer Beta-3", location: "Substation East", lat: 12.97, lng: 77.62, age_years: 18, health_score: 68, temperature_celsius: 78, load_percent: 88, vibration_level: 0.7, oil_quality: 0.72, status: "warning", predicted_failure_date: "2026-11-20", risk_level: "high" },
  { id: "TR-003", name: "Transformer Gamma-5", location: "Substation Central", lat: 12.98, lng: 77.60, age_years: 8, health_score: 95, temperature_celsius: 58, load_percent: 55, vibration_level: 0.2, oil_quality: 0.98, status: "healthy", predicted_failure_date: "2031-03-10", risk_level: "low" },
  { id: "TR-004", name: "Transformer Delta-2", location: "Substation South", lat: 28.59, lng: 77.20, age_years: 25, health_score: 42, temperature_celsius: 85, load_percent: 94, vibration_level: 1.2, oil_quality: 0.45, status: "critical", predicted_failure_date: "2026-08-05", risk_level: "critical" },
  { id: "TR-005", name: "Transformer Epsilon-7", location: "Substation West", lat: 12.96, lng: 77.56, age_years: 5, health_score: 98, temperature_celsius: 52, load_percent: 40, vibration_level: 0.1, oil_quality: 0.99, status: "healthy", predicted_failure_date: "2035-01-01", risk_level: "low" },
  { id: "TR-006", name: "Transformer Zeta-4", location: "Industrial Zone A", lat: 13.00, lng: 77.61, age_years: 15, health_score: 75, temperature_celsius: 72, load_percent: 82, vibration_level: 0.5, oil_quality: 0.80, status: "warning", predicted_failure_date: "2027-04-22", risk_level: "medium" },
  { id: "TR-007", name: "Transformer Eta-9", location: "Commercial Hub B", lat: 12.98, lng: 77.57, age_years: 20, health_score: 55, temperature_celsius: 80, load_percent: 90, vibration_level: 0.9, oil_quality: 0.60, status: "warning", predicted_failure_date: "2026-12-01", risk_level: "high" },
  { id: "TR-008", name: "Transformer Theta-6", location: "Residential Zone C", lat: 12.97, lng: 77.59, age_years: 3, health_score: 99, temperature_celsius: 48, load_percent: 35, vibration_level: 0.08, oil_quality: 0.99, status: "healthy", predicted_failure_date: "2038-07-15", risk_level: "low" },
];

// ══════════════════════════════════════════════
// Grid Topology (Quantum Healing)
// ══════════════════════════════════════════════
export const gridNodes: GridNode[] = [
  { id: "N-01", label: "Central Hub", lat: 12.9716, lng: 77.5946, type: "substation", status: "online", load_percentage: 72, name: "Central Substation", capacity_mw: 500 },
  { id: "N-02", label: "North Grid", lat: 12.9940, lng: 77.5990, type: "substation", status: "online", load_percentage: 65, name: "North Substation", capacity_mw: 350 },
  { id: "N-03", label: "East Grid", lat: 12.9700, lng: 77.6250, type: "substation", status: "online", load_percentage: 80, name: "East Substation", capacity_mw: 400 },
  { id: "N-04", label: "South Grid", lat: 28.5900, lng: 77.2000, type: "substation", status: "warning", load_percentage: 88, name: "South Substation", capacity_mw: 300 },
  { id: "N-05", label: "West Grid", lat: 12.9650, lng: 77.5600, type: "substation", status: "online", load_percentage: 45, name: "West Substation", capacity_mw: 250 },
  { id: "N-06", label: "Solar Alpha", lat: 12.9850, lng: 77.6150, type: "renewable", status: "online", load_percentage: 90, name: "Solar Farm Alpha", capacity_mw: 120 },
  { id: "N-07", label: "Wind Beta", lat: 13.0000, lng: 77.5750, type: "renewable", status: "online", load_percentage: 70, name: "Wind Park Beta", capacity_mw: 85 },
  { id: "N-08", label: "Battery-1", lat: 12.9600, lng: 77.6050, type: "storage", status: "online", load_percentage: 55, name: "Battery Storage 1", capacity_mw: 50 },
  { id: "N-09", label: "TR-Alpha", lat: 12.9800, lng: 77.5950, type: "transformer", status: "online", load_percentage: 68, name: "Transformer Alpha", capacity_mw: 100 },
  { id: "N-10", label: "TR-Beta", lat: 28.5950, lng: 77.5900, type: "transformer", status: "critical", load_percentage: 95, name: "Transformer Beta", capacity_mw: 80 },
  { id: "N-11", label: "TR-Gamma", lat: 12.9900, lng: 77.5850, type: "transformer", status: "online", load_percentage: 42, name: "Transformer Gamma", capacity_mw: 120 },
  { id: "N-12", label: "Hydro Plant", lat: 13.0050, lng: 77.6100, type: "renewable", status: "online", load_percentage: 85, name: "Hydro Plant Gamma", capacity_mw: 200 },
];

export const gridEdges: GridEdge[] = [
  { source: "N-01", target: "N-02", capacity: 200, load: 140, status: "active" },
  { source: "N-01", target: "N-03", capacity: 180, load: 150, status: "active" },
  { source: "N-01", target: "N-04", capacity: 150, load: 135, status: "overloaded" },
  { source: "N-01", target: "N-05", capacity: 120, load: 55, status: "active" },
  { source: "N-02", target: "N-06", capacity: 100, load: 90, status: "active" },
  { source: "N-02", target: "N-07", capacity: 80, load: 60, status: "active" },
  { source: "N-02", target: "N-11", capacity: 100, load: 42, status: "active" },
  { source: "N-03", target: "N-09", capacity: 90, load: 62, status: "active" },
  { source: "N-03", target: "N-08", capacity: 60, load: 30, status: "active" },
  { source: "N-04", target: "N-10", capacity: 70, load: 68, status: "overloaded" },
  { source: "N-05", target: "N-01", capacity: 100, load: 45, status: "active" },
  { source: "N-06", target: "N-03", capacity: 120, load: 108, status: "active" },
  { source: "N-12", target: "N-02", capacity: 200, load: 170, status: "active" },
];

// ══════════════════════════════════════════════
// Sustainability
// ══════════════════════════════════════════════
export const sustainabilityMetrics: SustainabilityMetrics = {
  co2_reduction_tons: 2847,
  energy_waste_reduction_percent: 23.4,
  renewable_percentage: 38.6,
  tree_equivalent: 71175,
  total_savings_usd: 4250000,
};

export const sdgContributions: SDGContribution[] = [
  { sdg_number: 7, title: "Affordable & Clean Energy", description: "Ensuring access to reliable, sustainable energy for all grid users.", progress: 72, impact_metric: "Clean Energy Generated", impact_value: 1850 },
  { sdg_number: 11, title: "Sustainable Cities", description: "Making urban infrastructure resilient and efficient.", progress: 65, impact_metric: "Smart Nodes Deployed", impact_value: 1248 },
  { sdg_number: 13, title: "Climate Action", description: "Reducing carbon footprint through grid optimization.", progress: 58, impact_metric: "CO₂ Reduced (tons)", impact_value: 2847 },
];

export function generateCO2History() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    solar: Math.round(80 + i * 12 + Math.random() * 20),
    wind: Math.round(60 + i * 8 + Math.random() * 15),
    hydro: Math.round(40 + i * 5 + Math.random() * 10),
    total: 0,
  })).map(d => ({ ...d, total: d.solar + d.wind + d.hydro }));
}

export const renewableBreakdown = [
  { name: "Solar", value: 42, color: "#FFB300" },
  { name: "Wind", value: 28, color: "#42A5F5" },
  { name: "Hydro", value: 22, color: "#26A69A" },
  { name: "Biomass", value: 8, color: "#8D6E63" },
];
