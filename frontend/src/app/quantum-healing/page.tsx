"use client";

import React from 'react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  Atom, Zap, Network, ServerCrash, Cpu, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gridNodes, gridEdges } from '@/lib/mock-data';

const GridTopology = dynamic(() => import('@/components/quantum/GridTopology'), { ssr: false });
const QAOAPanel = dynamic(() => import('@/components/quantum/QAOAPanel'), { ssr: false });

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

export default function QuantumHealingPage() {
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
            <Atom className="w-7 h-7 text-primary" />
            <span className="text-gradient">Adaptive Quantum Grid Healing</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Quantum Approximate Optimization Algorithm (QAOA) for dynamic rerouting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            QPU Simulator Active
          </Badge>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Nodes Online', value: '11/12', icon: Network, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Failed Nodes', value: 1, icon: ServerCrash, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Rerouted Paths', value: 3, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Quantum Advantage', value: '1.42x', icon: Cpu, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Live Grid Topology
              </CardTitle>
              <Badge variant="secondary" className="font-normal">
                Click any node to simulate failure
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 flex items-center justify-center min-h-[400px]">
              <GridTopology nodes={gridNodes} edges={gridEdges} />
            </CardContent>
          </Card>
        </motion.div>

        {/* QAOA Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <QAOAPanel />
        </motion.div>
      </div>

    </motion.div>
  );
}
