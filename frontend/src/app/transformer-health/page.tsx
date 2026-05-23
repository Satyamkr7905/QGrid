"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  Cpu, Thermometer, Activity, Settings, Calendar, AlertCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { transformers } from '@/lib/mock-data';

const RiskOverview = dynamic(() => import('@/components/transformer/RiskOverview'), {
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
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

function MiniBar({ value, colorClass }: { value: number, colorClass: string }) {
  return (
    <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function HealthCircle({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-rose-500';

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="32" cy="32" r={radius} className="stroke-muted/30" strokeWidth="6" fill="transparent" />
        <circle 
          cx="32" cy="32" r={radius} 
          className={`stroke-current ${color}`} 
          strokeWidth="6" 
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-sm font-bold">{score}</span>
      </div>
    </div>
  );
}

export default function TransformerHealthPage() {
  const stats = useMemo(() => {
    return {
      total: transformers.length,
      healthy: transformers.filter(t => t.status === 'healthy').length,
      warning: transformers.filter(t => t.status === 'warning').length,
      critical: transformers.filter(t => t.status === 'critical').length,
    };
  }, []);

  const riskData = useMemo(() => {
    return transformers.map(t => ({
      name: t.id,
      riskScore: 100 - t.health_score,
      level: t.risk_level
    })).sort((a, b) => b.riskScore - a.riskScore);
  }, []);

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
            <Cpu className="w-7 h-7 text-primary" />
            <span className="text-gradient">Predictive Transformer Failure</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Machine learning based health scoring and maintenance prediction
          </p>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Healthy', value: stats.healthy, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Warning', value: stats.warning, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Critical', value: stats.critical, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${s.bg} border-2 border-current ${s.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Overview Chart */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Fleet Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskOverview data={riskData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Maintenance */}
        <motion.div variants={itemVariants} className="xl:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Urgent Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transformers
                  .filter(t => t.risk_level === 'critical' || t.risk_level === 'high')
                  .sort((a, b) => new Date(a.predicted_failure_date).getTime() - new Date(b.predicted_failure_date).getTime())
                  .slice(0, 4)
                  .map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{t.id}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={t.risk_level === 'critical' ? 'text-rose-500 border-rose-500/30' : 'text-yellow-500 border-yellow-500/30'}>
                        {new Date(t.predicted_failure_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">Predicted Failure</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Grid of Transformer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {transformers.map((t, i) => (
          <motion.div key={t.id} variants={itemVariants}>
            <Card className={`glass-card overflow-hidden transition-all hover:shadow-lg ${t.status === 'critical' ? 'ring-1 ring-rose-500/50' : ''}`}>
              <div className={`h-1 w-full ${
                t.status === 'healthy' ? 'bg-green-500' :
                t.status === 'warning' ? 'bg-yellow-500' : 'bg-rose-500'
              }`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.id} • {t.location}</p>
                  </div>
                  <HealthCircle score={t.health_score} />
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp</span>
                        <span>{t.temperature_celsius}°C</span>
                      </div>
                      <MiniBar value={(t.temperature_celsius / 120) * 100} colorClass={t.temperature_celsius > 80 ? 'bg-rose-500' : t.temperature_celsius > 65 ? 'bg-yellow-500' : 'bg-green-500'} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Load</span>
                        <span>{t.load_percent}%</span>
                      </div>
                      <MiniBar value={t.load_percent} colorClass={t.load_percent > 90 ? 'bg-rose-500' : t.load_percent > 75 ? 'bg-yellow-500' : 'bg-green-500'} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> Oil Quality</span>
                      <span>{Math.round(t.oil_quality * 100)}%</span>
                    </div>
                    <MiniBar value={t.oil_quality * 100} colorClass={t.oil_quality < 0.5 ? 'bg-rose-500' : t.oil_quality < 0.7 ? 'bg-yellow-500' : 'bg-green-500'} />
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                    Risk: <span className={`ml-1 font-bold ${
                      t.risk_level === 'critical' ? 'text-rose-500' :
                      t.risk_level === 'high' ? 'text-yellow-500' :
                      t.risk_level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>{t.risk_level}</span>
                  </Badge>
                  {t.status === 'healthy' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : t.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
