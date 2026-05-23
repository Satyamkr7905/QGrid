"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, Activity, Siren, RadioTower, ServerCrash, Battery, Truck, Wind, Droplets, Mountain, ShieldOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { gridNodes } from '@/lib/mock-data';

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

function ResilienceGauge({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-rose-500';

  return (
    <div className="relative w-40 h-40 flex items-center justify-center mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="80" cy="80" r={radius} className="stroke-muted/30" strokeWidth="12" fill="transparent" />
        <circle 
          cx="80" cy="80" r={radius} 
          className={`stroke-current ${color} transition-all duration-1000 ease-out`} 
          strokeWidth="12" 
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}

const DISASTER_TYPES = [
  { id: 'storm', label: 'Severe Storm', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'flood', label: 'Flash Flood', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'earthquake', label: 'Earthquake', icon: Mountain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'cyber', label: 'Cyberattack', icon: ShieldOff, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

export default function DisasterResiliencePage() {
  const [activeTab, setActiveTab] = useState('storm');
  const [intensity, setIntensity] = useState([5]);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSimulate = () => {
    if (simulating) return;
    setSimulating(true);
    setResults(null);
    
    setTimeout(() => {
      setSimulating(false);
      setResults({
        affectedNodes: Math.floor(intensity[0] * 1.5),
        reroutedPaths: Math.floor(intensity[0] * 2.2),
        recoveryTime: `${Math.max(1, Math.floor(intensity[0] * 0.8))} hrs`,
        damageScore: intensity[0] * 8,
      });
    }, 2000);
  };

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
            <Siren className="w-7 h-7 text-rose-500" />
            <span className="text-gradient">Disaster Resilience Mode</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Emergency response simulations and critical infrastructure protection
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-rose-500/30 text-rose-500 bg-rose-500/5">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Emergency Protocols Ready
        </Badge>
      </motion.div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resilience Score */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg text-center">Overall Resilience Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResilienceGauge score={78} />
              
              <div className="space-y-4">
                {[
                  { label: 'Infrastructure', score: 82 },
                  { label: 'Redundancy', score: 75 },
                  { label: 'Response Time', score: 68 },
                  { label: 'Backup Power', score: 71 },
                ].map((s) => (
                  <div key={s.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{s.label}</span>
                      <span>{s.score}%</span>
                    </div>
                    <Progress value={s.score} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disaster Simulator */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Impact Simulation Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {DISASTER_TYPES.map(type => (
                    <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                      <type.icon className={`w-4 h-4 hidden sm:block ${type.color}`} />
                      <span className="hidden sm:block">{type.label}</span>
                      <span className="sm:hidden">{type.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="bg-muted/20 border border-border/50 p-6 rounded-xl space-y-6 min-h-[220px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold flex items-center gap-2">
                        Event Intensity Level
                      </h3>
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        Cat {intensity[0]}
                      </Badge>
                    </div>
                    <Slider
                      value={intensity}
                      onValueChange={(val) => setIntensity(val as number[])}
                      max={10}
                      min={1}
                      step={1}
                      disabled={simulating}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Minor Disturbance</span>
                      <span>Catastrophic Event</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSimulate} 
                    disabled={simulating}
                    className="w-full bg-rose-600 hover:bg-red-700 text-white"
                  >
                    {simulating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Running Monte Carlo Simulation...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Simulate Impact
                      </div>
                    )}
                  </Button>

                  <AnimatePresence>
                    {results && !simulating && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Affected Nodes</p>
                          <p className="text-xl font-bold text-rose-500">{results.affectedNodes}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rerouted Paths</p>
                          <p className="text-xl font-bold text-yellow-500">{results.reroutedPaths}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Recovery ETA</p>
                          <p className="text-xl font-bold text-blue-500">{results.recoveryTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Damage Index</p>
                          <p className="text-xl font-bold text-amber-500">{results.damageScore}/100</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Infrastructure */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Critical Infrastructure Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gridNodes.filter(n => n.capacity_mw >= 300).map((node, i) => (
                  <div key={node.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{node.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                      </div>
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/30">Priority {i + 1}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-background/50 p-2 rounded-lg text-center">
                        <ShieldAlert className="w-4 h-4 text-green-500 mx-auto mb-1" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Hardened</span>
                      </div>
                      <div className="bg-background/50 p-2 rounded-lg text-center">
                        <Battery className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">48h Backup</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Response Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          {[
            { label: 'Active Emergency Units', value: 42, icon: Truck, color: 'text-blue-500' },
            { label: 'Backup Generators Online', value: 156, icon: Battery, color: 'text-green-500' },
            { label: 'Comms Links Operational', value: '98.5%', icon: RadioTower, color: 'text-purple-500' },
            { label: 'Nodes in Failover Mode', value: 14, icon: ServerCrash, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-muted/50 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">{stat.label}</span>
                </div>
                <span className="font-bold text-lg">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

    </motion.div>
  );
}
