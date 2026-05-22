'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function CumulativeFlow() {
  const metrics = useSimulationStore((s) => s.metrics);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const data = metrics.map((m) => ({
    sprint: m.sprint,
    done: Math.round(m.done_items),
    wip: Math.round(m.wip_items),
    backlog: Math.round(m.backlog_size),
  }));

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        Kumulativní Flow Diagram
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
            formatter={(v, name) => [
              v,
              name === 'done' ? 'Hotovo' : name === 'wip' ? 'WIP' : 'Backlog',
            ] as [typeof v, string]}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          <Legend
            formatter={(value) => value === 'done' ? 'Hotovo' : value === 'wip' ? 'WIP' : 'Backlog'}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Area type="monotone" dataKey="done" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
          <Area type="monotone" dataKey="wip" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
          <Area type="monotone" dataKey="backlog" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
