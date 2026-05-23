"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  ShieldAlert, Activity, AlertTriangle, BadgeAlert, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { theftAlerts, smartMeters, generateAnomalyData } from '@/lib/mock-data';

const AnomalyChart = dynamic(() => import('@/components/theft/AnomalyChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
});

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function TheftDetectionPage() {
  const anomalyData = useMemo(() => generateAnomalyData(), []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-primary" />
            <span className="text-gradient">Theft Detection Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered anomaly detection and smart meter monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-primary/30 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Isolation Forest Model Active
          </Badge>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Anomalies (24h)', value: 124, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Investigations', value: 38, icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Confirmed Thefts', value: 12, icon: BadgeAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Revenue at Risk', value: '$42.5k', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Real-time Consumption vs Predicted (Global)</CardTitle>
            </CardHeader>
            <CardContent>
              <AnomalyChart data={anomalyData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert Timeline */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {theftAlerts.map((alert, i) => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-16px] before:w-[2px] before:bg-border last:before:hidden"
                  >
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-background ${
                      alert.severity === 'critical' ? 'bg-rose-500' : 
                      alert.severity === 'high' ? 'bg-yellow-500' : 
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{alert.meter_id}</span>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize mb-2">{alert.type.replace(/_/g, ' ')}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        <span className="font-mono text-primary">Score: {alert.anomaly_score.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Suspicious Meters Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Suspicious Meters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meter ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Consumption</TableHead>
                  <TableHead>Anomaly Score</TableHead>
                  <TableHead>Theft Probability</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smartMeters.slice(0, 10).map((meter) => (
                  <TableRow key={meter.id}>
                    <TableCell className="font-mono font-medium">{meter.id}</TableCell>
                    <TableCell>{meter.location}</TableCell>
                    <TableCell>{meter.consumption_kwh} kWh</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-xs">{meter.anomaly_score.toFixed(2)}</span>
                        <Progress value={meter.anomaly_score * 100} className="w-16 h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        meter.theft_probability > 0.8 ? 'text-rose-500 border-rose-500/30' :
                        meter.theft_probability > 0.5 ? 'text-yellow-500 border-yellow-500/30' :
                        'text-green-500 border-green-500/30'
                      }>
                        {Math.round(meter.theft_probability * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meter.status === 'confirmed_theft' ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Confirmed
                        </div>
                      ) : meter.status === 'suspicious' ? (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Suspicious
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
