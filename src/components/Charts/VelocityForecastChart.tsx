'use client';

import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function VelocityForecastChart() {
  const metrics = useSimulationStore((s) => s.metrics);
  const darkMode = useSimulationStore((s) => s.darkMode);

  // Show last 16 sprints + 4 sprint forecast
  const recent = metrics.slice(-16);

  const data = recent.map((m) => ({
    sprint: m.sprint,
    throughput: Math.round(m.throughput * 10) / 10,
    forecast: m.sprint === recent[recent.length - 1].sprint ? Math.round(m.velocity_forecast * 10) / 10 : undefined,
    forecastBandHigh: m.sprint === recent[recent.length - 1].sprint
      ? Math.round(m.velocity_forecast * 1.2 * 10) / 10
      : undefined,
    forecastBandLow: m.sprint === recent[recent.length - 1].sprint
      ? Math.round(m.velocity_forecast * 0.8 * 10) / 10
      : undefined,
  }));

  // Append 4 forecast sprints
  const lastMetric = recent[recent.length - 1];
  if (lastMetric) {
    for (let i = 1; i <= 4; i++) {
      data.push({
        sprint: lastMetric.sprint + i,
        throughput: undefined as unknown as number,
        forecast: Math.round(lastMetric.velocity_forecast * 10) / 10,
        forecastBandHigh: Math.round(lastMetric.velocity_forecast * (1.2 + i * 0.05) * 10) / 10,
        forecastBandLow: Math.round(Math.max(0, lastMetric.velocity_forecast * (0.8 - i * 0.03)) * 10) / 10,
      });
    }
  }

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        Velocity prognóza <span className={`font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>(posledních 16 + 4 sprintů)</span>
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: textColor }} />
          <YAxis tick={{ fontSize: 10, fill: textColor }} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#fff',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          <Area dataKey="forecastBandHigh" stroke="transparent" fill="#3b82f6" fillOpacity={0.1} />
          <Area dataKey="forecastBandLow" stroke="transparent" fill="#0f172a" fillOpacity={1} />
          <Line type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} dot={false} name="Skutečný throughput" />
          <Line type="monotone" dataKey="forecast" stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Prognóza" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
