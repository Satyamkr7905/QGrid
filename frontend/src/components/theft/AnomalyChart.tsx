"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useTheme } from 'next-themes';
import { CHART_COLORS } from '@/lib/constants';

interface Props {
  data: Array<{
    hour: string;
    normal: number;
    anomalous: number;
    threshold: number;
  }>;
}

export default function AnomalyChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const colors = resolvedTheme === 'dark' ? CHART_COLORS.dark : CHART_COLORS.light;

  const chartTooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(251,140,0,0.2)' : 'rgba(46,125,50,0.2)'}`,
    borderRadius: '12px',
    color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a2e1a',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAnomalous" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.danger} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.danger} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} interval={2} />
          <YAxis tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <ReferenceLine y={380} label={{ position: 'top', value: 'Threshold', fill: colors.warning, fontSize: 10 }} stroke={colors.warning} strokeDasharray="3 3" />
          <Area type="monotone" dataKey="normal" stroke={colors.primary} fill="url(#gradNormal)" strokeWidth={2} name="Expected (kWh)" dot={false} />
          <Area type="monotone" dataKey="anomalous" stroke={colors.danger} fill="url(#gradAnomalous)" strokeWidth={2} name="Actual (kWh)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
