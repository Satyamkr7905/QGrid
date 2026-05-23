// Q-Grid Shield — Constants & Configuration

export const APP_NAME = "Q-Grid Shield";
export const APP_DESCRIPTION = "Smart Grid Management Dashboard — AI & Quantum Powered";

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Grid overview & KPIs",
  },
  {
    title: "Smart City Map",
    href: "/heatmap",
    icon: "Map",
    description: "Interactive heatmap",
  },
  {
    title: "Theft Detection",
    href: "/theft-detection",
    icon: "ShieldAlert",
    description: "AI anomaly detection",
  },
  {
    title: "Quantum Healing",
    href: "/quantum-healing",
    icon: "Atom",
    description: "QAOA grid optimization",
  },
  {
    title: "Transformer Health",
    href: "/transformer-health",
    icon: "Cpu",
    description: "Predictive maintenance",
  },
  {
    title: "Sustainability",
    href: "/sustainability",
    icon: "Leaf",
    description: "Green energy analytics",
  },
  {
    title: "Disaster Resilience",
    href: "/disaster-resilience",
    icon: "ShieldCheck",
    description: "Emergency response",
  },
] as const;

export const CHART_COLORS = {
  light: {
    primary: '#2E7D32',
    soft: '#66BB6A',
    secondary: '#43A047',
    tertiary: '#81C784',
    quaternary: '#A5D6A7',
    danger: '#E91E63', // Pink instead of red
    warning: '#FDD835', // Yellow instead of orange
    info: '#1976D2',
  },
  dark: {
    primary: '#00E5FF',
    soft: '#1DE9B6',
    secondary: '#2979FF',
    tertiary: '#D500F9',
    quaternary: '#FF4081',
    danger: '#E91E63', // Pink instead of red
    warning: '#FFEA00', // Yellow instead of orange
    info: '#00B0FF',
  },
} as const;

export const MAP_CENTER: [number, number] = [12.9716, 77.5946]; // Bangalore
export const MAP_ZOOM = 12;
