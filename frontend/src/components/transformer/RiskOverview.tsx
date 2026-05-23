"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { CHART_COLORS } from '@/lib/constants';

interface Props {
  data: Array<{
    name: string;
    riskScore: number;
    level: string;
  }>;
}

export default function RiskOverview({ data }: Props) {
  const { resolvedTheme } = useTheme();
  
  const chartTooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '12px',
    color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a1a1a',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  };

  const getColor = (level: string) => {
    switch(level) {
      case 'low': return CHART_COLORS[resolvedTheme === 'dark' ? 'dark' : 'light'].primary;
      case 'medium': return CHART_COLORS[resolvedTheme === 'dark' ? 'dark' : 'light'].warning;
      case 'high': return '#FFEA00'; // orange
      case 'critical': return CHART_COLORS[resolvedTheme === 'dark' ? 'dark' : 'light'].danger;
      default: return '#8884d8';
    }
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} 
            angle={-45} 
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 10, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
          <Tooltip 
            contentStyle={chartTooltipStyle}
            cursor={{ fill: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
          <Bar dataKey="riskScore" name="Risk Score (0-100)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.level)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
