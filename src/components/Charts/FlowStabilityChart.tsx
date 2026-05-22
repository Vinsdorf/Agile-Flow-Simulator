'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSimulationStore } from '@/store/simulationStore';

export function FlowStabilityChart() {
  const metrics = useSimulationStore((s) => s.metrics);
  const comparisonSnapshot = useSimulationStore((s) => s.comparisonSnapshot);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const data = metrics.map((m, i) => ({
    sprint: m.sprint,
    stability: m.flow_stability,
    wipRatio: Math.round(m.wip_vs_limit * 100),
    defectRate: m.defect_rate,
    comp: comparisonSnapshot?.metrics[i]?.flow_stability,
  }));

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#64748b' : '#94a3b8';

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        Flow stabilita & WIP vs. Limit
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
              `${v}%`,
              name === 'stability' ? 'Flow stabilita' : name === 'wipRatio' ? 'WIP % limitu' : 'Defekty',
            ] as [string, string]}
            labelFormatter={(l) => `Sprint ${l}`}
          />
          <Bar dataKey="wipRatio" fill="#3b82f6" fillOpacity={0.4} name="wipRatio" />
          {comparisonSnapshot && (
            <Line type="monotone" dataKey="comp" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
          <Line type="monotone" dataKey="stability" stroke="#22c55e" strokeWidth={2} dot={false} name="stability" />
          <Line type="monotone" dataKey="defectRate" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="defectRate" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block"></span>Flow stabilita</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-400 opacity-50 inline-block"></span>WIP % limitu</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block"></span>Defekty</span>
      </div>
    </div>
  );
}
