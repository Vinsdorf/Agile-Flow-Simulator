'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function TeamEnergyChart() {
  const metrics = useSimulationStore((s) => s.metrics);
  const comparisonSnapshot = useSimulationStore((s) => s.comparisonSnapshot);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const data = metrics.map((m, i) => ({
    sprint: m.sprint,
    energy: m.team_energy,
    comp: comparisonSnapshot?.metrics[i]?.team_energy,
  }));

  const lastEnergy = metrics[metrics.length - 1]?.team_energy ?? 0;
  const isBurnout = lastEnergy < 30;
  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          Energie týmu / Burnout riziko
        </h3>
        {isBurnout && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">
            ⚠️ Burnout riziko!
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: textColor }} interval={7} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: textColor }} />
          <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Burnout hranice', fontSize: 10, fill: '#ef4444' }} />
          <ReferenceLine y={60} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Zdravá zóna', fontSize: 10, fill: '#22c55e' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#1e293b' : '#fff',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [`${v}%`, 'Energie'] as [string, string]}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          {comparisonSnapshot && (
            <Area type="monotone" dataKey="comp" stroke="#94a3b8" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
          <Area
            type="monotone"
            dataKey="energy"
            stroke={lastEnergy < 30 ? '#ef4444' : '#22c55e'}
            fill={lastEnergy < 30 ? '#ef4444' : '#22c55e'}
            fillOpacity={0.25}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
