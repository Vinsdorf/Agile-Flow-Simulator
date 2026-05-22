'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function CycleTimeChart() {
  const metrics = useSimulationStore((s) => s.metrics);
  const comparisonSnapshot = useSimulationStore((s) => s.comparisonSnapshot);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const data = metrics.map((m, i) => ({
    sprint: m.sprint,
    cycleTime: Math.round(m.cycle_time * 10) / 10,
    comp: comparisonSnapshot?.metrics[i]?.cycle_time
      ? Math.round(comparisonSnapshot.metrics[i].cycle_time * 10) / 10
      : undefined,
  }));

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        Cycle Time <span className={`font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>(sprinty)</span>
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: textColor }} interval={7} />
          <YAxis tick={{ fontSize: 10, fill: textColor }} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#fff',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v, name) => [v, name === 'cycleTime' ? 'Cycle Time' : 'Porovnání'] as [typeof v, string]}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          {comparisonSnapshot && (
            <Line type="monotone" dataKey="comp" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
          <Line type="monotone" dataKey="cycleTime" stroke="#a855f7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
