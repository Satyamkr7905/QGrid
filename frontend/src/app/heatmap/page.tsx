'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  Map, Filter, Layers, Radio, Zap, AlertTriangle,
  Leaf, Battery, CircleDot, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { gridNodes } from '@/lib/mock-data';

const SmartCityMap = dynamic(() => import('@/components/heatmap/SmartCityMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-xl bg-muted/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
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

const NODE_LEGEND = [
  { type: 'substation', color: '#1976D2', icon: Radio, label: 'Substation' },
  { type: 'transformer', color: '#FB8C00', icon: Zap, label: 'Transformer' },
  { type: 'renewable', color: '#2E7D32', icon: Leaf, label: 'Renewable' },
  { type: 'storage', color: '#7B1FA2', icon: Battery, label: 'Storage' },
  { type: 'meter', color: '#757575', icon: CircleDot, label: 'Smart Meter' },
];

export default function HeatmapPage() {
  const [selectedType, setSelectedType] = useState('all');

  const stats = useMemo(() => {
    const totalNodes = gridNodes.length;
    const overloaded = gridNodes.filter((n) => n.load_percentage > 85).length;
    const outageRisk = gridNodes.filter((n) => n.status === 'critical' || n.status === 'warning').length;
    const renewableActive = gridNodes.filter((n) => n.type === 'renewable' && n.status === 'online').length;
    return { totalNodes, overloaded, outageRisk, renewableActive };
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
            <Map className="w-7 h-7 text-primary" />
            <span className="text-gradient">Smart City Heatmap</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive grid topology with real-time node monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Data
          </Badge>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedType} onValueChange={(val) => setSelectedType(val || "")}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Nodes</SelectItem>
                <SelectItem value="substation">Substations</SelectItem>
                <SelectItem value="transformer">Transformers</SelectItem>
                <SelectItem value="renewable">Renewable</SelectItem>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="meter">Smart Meters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Map + Legend */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Map */}
        <motion.div variants={itemVariants} className="xl:col-span-3">
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-0">
              <SmartCityMap nodes={gridNodes} selectedType={selectedType} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Legend Panel */}
        <motion.div variants={itemVariants} className="xl:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Node Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {NODE_LEGEND.map((item) => {
                const Icon = item.icon;
                const count = gridNodes.filter((n) => n.type === item.type).length;
                return (
                  <button
                    key={item.type}
                    onClick={() => setSelectedType(selectedType === item.type ? 'all' : item.type)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all hover:bg-muted/50 ${
                      selectedType === item.type ? 'bg-muted/60 ring-1 ring-primary/30' : ''
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Status Legend */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Status Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { status: 'Online', color: 'bg-green-500', border: 'border-green-500', key: 'online' },
                { status: 'Warning', color: 'bg-yellow-500', border: 'border-yellow-500', key: 'warning' },
                { status: 'Critical', color: 'bg-rose-500', border: 'border-rose-500', key: 'critical' },
                { status: 'Offline', color: 'bg-gray-500', border: 'border-gray-500', key: 'offline' },
              ].map((s) => {
                const count = gridNodes.filter((n) => n.status === s.key).length;
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${s.border}`}>
                      <div className={`w-full h-full rounded-full ${s.color} opacity-60`} />
                    </div>
                    <span className="text-sm flex-1">{s.status}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Nodes',
            value: stats.totalNodes,
            icon: <Radio className="w-5 h-5" />,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Overloaded',
            value: stats.overloaded,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
          },
          {
            label: 'Outage Risk',
            value: stats.outageRisk,
            icon: <Zap className="w-5 h-5" />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
          },
          {
            label: 'Renewable Active',
            value: stats.renewableActive,
            icon: <Leaf className="w-5 h-5" />,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
