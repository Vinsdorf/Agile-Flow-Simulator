'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

const typeStyles = {
  positive: 'bg-green-500/10 border-green-500/30 text-green-400',
  negative: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  neutral: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const typeIcons = {
  positive: '✅',
  negative: '📉',
  warning: '⚠️',
  neutral: '💡',
};

export function InsightsBar() {
  const insights = useSimulationStore((s) => s.insights);
  const darkMode = useSimulationStore((s) => s.darkMode);
  const [expanded, setExpanded] = useState(true);

  if (insights.length === 0) return null;

  return (
    <div className={`border-t ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-slate-50'}`}>
      <button
        className={`w-full flex items-center justify-between px-4 py-2 text-left ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          💡 KONTEXTOVÉ INSIGHTY ({insights.length})
        </span>
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} ${expanded ? 'rotate-180' : ''} transition-transform`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`text-xs p-2.5 rounded-lg border ${typeStyles[insight.type]}`}
            >
              <span className="mr-1.5">{typeIcons[insight.type]}</span>
              {insight.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
