'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function TechDebtChart() {
  const metrics = useSimulationStore((s) => s.metrics);
  const comparisonSnapshot = useSimulationStore((s) => s.comparisonSnapshot);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const data = metrics.map((m, i) => ({
    sprint: m.sprint,
    debt: m.technical_debt,
    comp: comparisonSnapshot?.metrics[i]?.technical_debt,
  }));

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        Technický dluh <span className={`font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>(0–100)</span>
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: textColor }} interval={7} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: textColor }} />
          <ReferenceLine y={40} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Varovná hranice', fontSize: 10, fill: '#eab308' }} />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Kritická hranice', fontSize: 10, fill: '#ef4444' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#fff',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${v}%`, 'Tech Dluh'] as [string, string]}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          {comparisonSnapshot && (
            <Area type="monotone" dataKey="comp" stroke="#94a3b8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
          <Area
            type="monotone"
            dataKey="debt"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
