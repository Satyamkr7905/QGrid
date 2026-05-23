"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Atom, Play, CheckCircle2, TrendingDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { CHART_COLORS } from '@/lib/constants';

const mockConvergenceData = [
  { iteration: 0, cost: 100 },
  { iteration: 10, cost: 82 },
  { iteration: 20, cost: 65 },
  { iteration: 30, cost: 50 },
  { iteration: 40, cost: 42 },
  { iteration: 50, cost: 38 },
  { iteration: 60, cost: 35 },
  { iteration: 70, cost: 33 },
  { iteration: 80, cost: 32.5 },
  { iteration: 90, cost: 32.2 },
  { iteration: 100, cost: 32 },
];

export default function QAOAPanel() {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [layers, setLayers] = useState([3]);
  const [iterations, setIterations] = useState([100]);
  
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light;

  const handleRun = () => {
    if (running || completed) return;
    setRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      setRunning(false);
      setCompleted(true);
    }, 3000);
  };

  const chartTooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(251,140,0,0.2)' : 'rgba(46,125,50,0.2)'}`,
    borderRadius: '12px',
    color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a2e1a',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  };

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-primary" />
            QAOA Configuration
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">Qiskit Aer</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Parameters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">P-Layers (Depth)</span>
              <span className="font-medium">{layers[0]}</span>
            </div>
            <Slider
              value={layers}
              onValueChange={(val) => setLayers(val as number[])}
              max={10}
              min={1}
              step={1}
              disabled={running}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max Iterations (COBYLA)</span>
              <span className="font-medium">{iterations[0]}</span>
            </div>
            <Slider
              value={iterations}
              onValueChange={(val) => setIterations(val as number[])}
              max={500}
              min={50}
              step={50}
              disabled={running}
            />
          </div>
        </div>

        <Button
          onClick={handleRun}
          disabled={running || completed}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {running ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Simulating Quantum Circuit...
            </div>
          ) : completed ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Optimization Complete
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Run QAOA Optimization
            </div>
          )}
        </Button>

        {/* Results Area */}
        <div className="mt-4 flex-1 flex flex-col border border-border/50 rounded-xl bg-muted/20 p-4 relative overflow-hidden">
          {(!running && !completed) && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/50 backdrop-blur-[2px] z-10">
              Run optimizer to view convergence
            </div>
          )}
          
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Cost Function Convergence
          </h4>
          
          <div className="h-[160px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockConvergenceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} />
                <XAxis dataKey="iteration" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={running || completed}
                  animationDuration={running ? 3000 : 0}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <AnimatePresence mode="popLayout">
            {completed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Cost Reduction</p>
                  <p className="text-lg font-bold text-green-500">68.0%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantum Advantage</p>
                  <p className="text-lg font-bold text-primary">1.42x</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// Need to import AnimatePresence as it's not exported from motion/react directly sometimes
// wait, AnimatePresence is exported from motion/react. Let me fix the import
import { AnimatePresence } from 'motion/react';
