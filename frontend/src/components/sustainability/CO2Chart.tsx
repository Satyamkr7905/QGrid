"use client";

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from 'next-themes';

interface Props {
  data: Array<{
    month: string;
    solar: number;
    wind: number;
    hydro: number;
    total: number;
  }>;
}

export default function CO2Chart({ data }: Props) {
  const { resolvedTheme } = useTheme();

  const chartTooltipStyle = {
    backgroundColor: resolvedTheme === 'dark' ? '#1E1E1E' : '#ffffff',
    border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '12px',
    color: resolvedTheme === 'dark' ? '#E0E0E0' : '#1a1a1a',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB300" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFB300" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#42A5F5" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#26A69A" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#26A69A" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? '#333' : '#e0e0e0'} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
          <YAxis tick={{ fontSize: 11, fill: resolvedTheme === 'dark' ? '#9E9E9E' : '#5a7a5a' }} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="solar" stackId="1" stroke="#FFB300" fill="url(#colorSolar)" name="Solar" />
          <Area type="monotone" dataKey="wind" stackId="1" stroke="#42A5F5" fill="url(#colorWind)" name="Wind" />
          <Area type="monotone" dataKey="hydro" stackId="1" stroke="#26A69A" fill="url(#colorHydro)" name="Hydro" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
