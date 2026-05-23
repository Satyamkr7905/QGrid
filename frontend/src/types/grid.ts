// Q-Grid Shield — Type Definitions

export interface GridNode {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: 'substation' | 'transformer' | 'meter' | 'renewable' | 'storage';
  status: 'online' | 'offline' | 'warning' | 'critical';
  load_percentage: number;
  name: string;
  capacity_mw: number;
}

export interface GridEdge {
  source: string;
  target: string;
  capacity: number;
  load: number;
  status: 'active' | 'overloaded' | 'failed' | 'rerouted';
}

export interface EnergyRoute {
  id: string;
  source: string;
  destination: string;
  power_flow_mw: number;
  status: 'active' | 'congested' | 'rerouting';
  efficiency: number;
}

export interface TheftAlert {
  id: string;
  meter_id: string;
  location: string;
  timestamp: string;
  anomaly_score: number;
  theft_probability: number;
  type: 'consumption_spike' | 'meter_bypass' | 'phase_imbalance' | 'reverse_flow';
  status: 'active' | 'investigating' | 'confirmed' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SmartMeter {
  id: string;
  location: string;
  lat: number;
  lng: number;
  consumption_kwh: number;
  anomaly_score: number;
  theft_probability: number;
  status: 'normal' | 'suspicious' | 'confirmed_theft';
  last_reading: string;
}

export interface Transformer {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  age_years: number;
  health_score: number;
  temperature_celsius: number;
  load_percent: number;
  vibration_level: number;
  oil_quality: number;
  status: 'healthy' | 'warning' | 'critical';
  predicted_failure_date: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface DashboardMetrics {
  grid_efficiency: number;
  active_theft_alerts: number;
  transformer_health: number;
  renewable_percentage: number;
  carbon_reduction_tons: number;
  total_nodes: number;
  active_nodes: number;
  total_demand_mw: number;
  total_supply_mw: number;
}

export interface SustainabilityMetrics {
  co2_reduction_tons: number;
  energy_waste_reduction_percent: number;
  renewable_percentage: number;
  tree_equivalent: number;
  total_savings_usd: number;
}

export interface SDGContribution {
  sdg_number: number;
  title: string;
  description: string;
  progress: number;
  impact_metric: string;
  impact_value: number;
}

export interface DisasterSimulation {
  disaster_type: 'storm' | 'flood' | 'earthquake' | 'cyberattack';
  intensity: number;
  affected_area: string;
  affected_nodes: number;
  resilience_score: number;
  estimated_recovery_hours: number;
  rerouted_paths: number;
  critical_nodes_protected: number;
}

export interface QAOAResult {
  optimal_routes: string[];
  cost_reduction: number;
  convergence_data: { iteration: number; cost: number }[];
  quantum_advantage: number;
  execution_time_ms: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export interface HeatmapLayer {
  type: 'overload' | 'outage_risk' | 'theft' | 'renewable';
  data: { lat: number; lng: number; intensity: number; radius: number }[];
}
