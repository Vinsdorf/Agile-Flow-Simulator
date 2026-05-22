'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';

export function ComparisonView() {
  const { snapshots, comparisonSnapshot, saveSnapshot, setComparisonSnapshot, removeSnapshot, darkMode } =
    useSimulationStore();
  const metrics = useSimulationStore((s) => s.metrics);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [label, setLabel] = useState('');

  const lastMetric = metrics[metrics.length - 1];

  const handleSave = () => {
    if (label.trim()) {
      saveSnapshot(label.trim());
      setLabel('');
      setShowSaveInput(false);
    }
  };

  return (
    <div className={`rounded-xl p-3 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Porovnání konfigurací
        </h3>
        <button
          className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          onClick={() => setShowSaveInput(true)}
        >
          + Uložit snapshot
        </button>
      </div>

      {showSaveInput && (
        <div className="flex gap-2 mb-2">
          <input
            className={`flex-1 text-xs px-2 py-1 rounded border ${
              darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
            }`}
            placeholder="Název snapshotu..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button className="text-xs px-2 py-1 rounded bg-green-600 text-white" onClick={handleSave}>✓</button>
          <button className="text-xs px-2 py-1 rounded bg-slate-600 text-white" onClick={() => setShowSaveInput(false)}>✗</button>
        </div>
      )}

      {snapshots.length === 0 && (
        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Uložte snapshot aktuální konfigurace a porovnejte s jiným nastavením.
        </p>
      )}

      <div className="space-y-1.5">
        {snapshots.map((snap) => {
          const snapLast = snap.metrics[snap.metrics.length - 1];
          const isActive = comparisonSnapshot?.id === snap.id;
          return (
            <div
              key={snap.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : darkMode
                  ? 'border-slate-700 hover:border-slate-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => setComparisonSnapshot(isActive ? null : snap)}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {snap.label}
                </div>
                <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Score: {snapLast.flow_score} | Energie: {snapLast.team_energy}% | Dluh: {snapLast.technical_debt}%
                </div>
              </div>
              {lastMetric && snapLast && (
                <div className={`text-xs font-bold ${lastMetric.flow_score >= snapLast.flow_score ? 'text-green-400' : 'text-red-400'}`}>
                  {lastMetric.flow_score >= snapLast.flow_score ? '+' : ''}
                  {Math.round(lastMetric.flow_score - snapLast.flow_score)}
                </div>
              )}
              <button
                className="text-slate-500 hover:text-red-400 text-xs"
                onClick={(e) => { e.stopPropagation(); removeSnapshot(snap.id); }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
