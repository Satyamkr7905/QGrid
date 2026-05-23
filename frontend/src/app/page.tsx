"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Activity, ShieldAlert, Cpu, Leaf, Cloud, Zap,
  TrendingUp, TrendingDown, ArrowUpRight, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardMetrics, energyRoutes, generateTimeSeriesData, theftAlerts } from '@/lib/mock-data';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/dashboard/DashboardCharts'), { ssr: false });

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}</span>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  suffix: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
  decimals?: number;
}

function MetricCard({ title, value, suffix, trend, icon, color, decimals = 0 }: MetricCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card overflow-hidden group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">
                <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
              </p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-rose-500'}`}>
                  {isPositive ? '+' : ''}{trend}%
                </span>
                <span className="text-xs text-muted-foreground">vs last hour</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const timeSeriesData = useMemo(() => generateTimeSeriesData(24), []);
  const m = dashboardMetrics;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Grid Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time monitoring & analytics overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Online
          </Badge>
          <Badge variant="secondary" className="px-3 py-1.5">
            <BarChart3 className="w-3 h-3 mr-1" />
            {m.total_nodes} Nodes
          </Badge>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Grid Efficiency"
          value={m.grid_efficiency}
          suffix="%"
          trend={2.3}
          decimals={1}
          icon={<Activity className="w-5 h-5 text-green-600 dark:text-green-400" />}
          color="bg-green-500/10"
        />
        <MetricCard
          title="Active Theft Alerts"
          value={m.active_theft_alerts}
          suffix=""
          trend={-8.5}
          icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
          color="bg-rose-500/10"
        />
        <MetricCard
          title="Transformer Health"
          value={m.transformer_health}
          suffix="%"
          trend={1.2}
          decimals={1}
          icon={<Cpu className="w-5 h-5 text-blue-500" />}
          color="bg-blue-500/10"
        />
        <MetricCard
          title="Renewable Energy"
          value={m.renewable_percentage}
          suffix="%"
          trend={5.7}
          decimals={1}
          icon={<Leaf className="w-5 h-5 text-emerald-500" />}
          color="bg-emerald-500/10"
        />
        <MetricCard
          title="CO₂ Reduced"
          value={m.carbon_reduction_tons}
          suffix=" t"
          trend={12.4}
          icon={<Cloud className="w-5 h-5 text-cyan-500" />}
          color="bg-cyan-500/10"
        />
      </div>

      {/* Charts & Energy Routing */}
      <DashboardCharts timeSeriesData={timeSeriesData} />

      {/* Energy Routes & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Energy Routes */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Live Energy Routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {energyRoutes.map((route) => (
                <div key={route.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      route.status === 'active' ? 'bg-green-500' :
                      route.status === 'congested' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{route.source}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {route.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold">{route.power_flow_mw} MW</p>
                    <p className="text-xs text-muted-foreground">{route.efficiency}% eff</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {theftAlerts.slice(0, 6).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-[10px] shrink-0"
                    >
                      {alert.severity}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{alert.meter_id} — {alert.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{alert.location}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 ml-3">
                    {Math.round(alert.theft_probability * 100)}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
