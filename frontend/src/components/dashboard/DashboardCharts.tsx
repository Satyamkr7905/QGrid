"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { Activity, Battery, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { CHART_COLORS } from '@/lib/constants';

interface Props {
  timeSeriesData: Array<{
    hour: string;
    efficiency: number;
    demand: number;
    supply: number;
    renewable: number;
    carbon: number;
  }>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const supplyDemandData = [
  { name: "Residential", demand: 1800, supply: 1900 },
  { name: "Commercial", demand: 1200, supply: 1300 },
  { name: "Industrial", demand: 900, supply: 950 },
  { name: "Public", demand: 420, supply: 450 },
  { name: "EV Charging", demand: 200, supply: 180 },
];

const sourceData = [
  { name: "Solar", value: 35, color: "#FFB300" },
  { name: "Wind", value: 22, color: "#42A5F5" },
  { name: "Hydro", value: 18, color: "#26A69A" },
  { name: "Grid Import", value: 20, color: "#AB47BC" },
  { name: "Storage", value: 5, color: "#EF5350" },
];

export default function DashboardCharts({ timeSeriesData }: Props) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light;

  const chartTooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,183,77,0.2)' : 'rgba(46,125,50,0.2)'}`,
    borderRadius: '12px',
    color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a2e1a',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Grid Efficiency Over Time */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Grid Efficiency & Demand (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRenewable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.soft} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.soft} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} interval={3} />
                  <YAxis tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} domain={[80, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="efficiency" stroke={colors.primary} fill="url(#gradEfficiency)" strokeWidth={2} name="Efficiency %" dot={false} />
                  <Area type="monotone" dataKey="renewable" stroke={colors.soft} fill="url(#gradRenewable)" strokeWidth={2} name="Renewable %" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Source Breakdown */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Battery className="w-4 h-4 text-primary" />
              Energy Source Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supply vs Demand */}
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Supply vs Demand by Sector (MW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplyDemandData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
                  <YAxis tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="demand" fill={colors.danger} name="Demand" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="supply" fill={colors.primary} name="Supply" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
