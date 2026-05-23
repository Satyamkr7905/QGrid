"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  Leaf, Cloud, TreeDeciduous, DollarSign, Target, Recycle, ZapOff, Sun
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { sustainabilityMetrics, sdgContributions, generateCO2History, renewableBreakdown } from '@/lib/mock-data';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

const CO2Chart = dynamic(() => import('@/components/sustainability/CO2Chart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function DonutChart({ data }: { data: any[] }) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{
              backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a1a1a',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            itemStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SustainabilityPage() {
  const co2Data = useMemo(() => generateCO2History(), []);
  const m = sustainabilityMetrics;

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
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-gradient">Sustainability Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Tracking carbon reduction, renewable integration, and SDG progress
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Net-Zero Tracking Active
        </Badge>
      </motion.div>

      {/* Impact KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'CO₂ Reduced', value: `${m.co2_reduction_tons}t`, icon: Cloud, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Energy Saved', value: `${m.energy_waste_reduction_percent}%`, icon: ZapOff, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Renewables', value: `${m.renewable_percentage}%`, icon: Sun, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Tree Equivalent', value: m.tree_equivalent.toLocaleString(), icon: TreeDeciduous, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Total Savings', value: `$${(m.total_savings_usd / 1000000).toFixed(2)}M`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="col-span-1">
            <Card className="glass-card h-full">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full">
                <div className={`p-3 rounded-full ${kpi.bg} mb-3`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CO2 Reduction Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                CO₂ Reduction by Source (12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CO2Chart data={co2Data} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Renewable Breakdown */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Recycle className="w-5 h-5 text-primary" />
                Renewable Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={renewableBreakdown} />
              <div className="space-y-3 mt-4">
                {renewableBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SDG Contributions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Sustainable Development Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sdgContributions.map((sdg) => {
            const colorClass = sdg.sdg_number === 7 ? 'text-yellow-500' : sdg.sdg_number === 11 ? 'text-yellow-500' : 'text-green-500';
            const bgClass = sdg.sdg_number === 7 ? 'bg-yellow-500' : sdg.sdg_number === 11 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <Card key={sdg.sdg_number} className="glass-card overflow-hidden">
                <div className={`h-2 w-full ${bgClass}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={`${colorClass} border-current`}>SDG {sdg.sdg_number}</Badge>
                    <span className="text-2xl font-bold">{sdg.progress}%</span>
                  </div>
                  <CardTitle className="text-lg">{sdg.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {sdg.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Goal Progress</span>
                    </div>
                    <Progress value={sdg.progress} className={`h-2 [&>div]:${bgClass}`} />
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{sdg.impact_metric}</span>
                    <span className="font-bold">{sdg.impact_value.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
