'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulationStore';

function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 75) return 'Výborný';
  if (score >= 55) return 'Dobrý';
  if (score >= 35) return 'Podprůměrný';
  return 'Kritický';
}

export function FlowScoreGauge() {
  const metrics = useSimulationStore((s) => s.metrics);
  const darkMode = useSimulationStore((s) => s.darkMode);
  const comparisonSnapshot = useSimulationStore((s) => s.comparisonSnapshot);

  if (metrics.length === 0) return null;

  const currentScore = metrics[metrics.length - 1].flow_score;
  const comparisonScore = comparisonSnapshot?.metrics[comparisonSnapshot.metrics.length - 1].flow_score;
  const diff = comparisonScore !== undefined ? currentScore - comparisonScore : null;

  const color = scoreColor(currentScore);
  const circumference = 2 * Math.PI * 54;
  const dashoffset = circumference * (1 - currentScore / 100);

  return (
    <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/60' : 'bg-white shadow-sm border border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          Flow Efficiency Score
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
          Hlavní metrika
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke={darkMode ? '#1e293b' : '#e2e8f0'} strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{currentScore}</span>
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>/100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold mb-1" style={{ color }}>
            {scoreLabel(currentScore)}
          </div>
          {diff !== null && (
            <div className={`text-sm font-medium mb-2 ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {diff >= 0 ? '+' : ''}{Math.round(diff)} vs. snapshot
            </div>
          )}
          <div className="space-y-1">
            {[
              { label: 'Energie týmu', value: metrics[metrics.length - 1].team_energy, unit: '%' },
              { label: 'Tech dluh', value: metrics[metrics.length - 1].technical_debt, unit: '%', invert: true },
              { label: 'Flow stabilita', value: metrics[metrics.length - 1].flow_stability, unit: '%' },
            ].map(({ label, value, unit, invert }) => {
              const isGood = invert ? value < 40 : value > 60;
              return (
                <div key={label} className="flex items-center gap-2">
                  <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                  <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${invert ? 100 - value : value}%`,
                        backgroundColor: isGood ? '#22c55e' : value > 30 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {value}{unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
