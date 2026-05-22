'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import { SYSTEM_PARAMETER_GROUPS, DEFAULT_PARAMETERS } from '@/engine/parameters';
import { ParameterDefinition } from '@/engine/types';

function formatValue(value: number, format: ParameterDefinition['format']): string {
  if (format === 'percent') return `${value}%`;
  if (format === 'days') return `${value} dní`;
  return `${value}`;
}

interface SystemSliderProps {
  param: ParameterDefinition;
}

function SystemSlider({ param }: SystemSliderProps) {
  const value = useSimulationStore((s) => s.parameters[param.key]);
  const setParameter = useSimulationStore((s) => s.setParameter);
  const darkMode = useSimulationStore((s) => s.darkMode);
  const [showTooltip, setShowTooltip] = useState(false);

  const defaultVal = DEFAULT_PARAMETERS[param.key];
  const isChanged = value !== defaultVal;
  const percent = ((value - param.min) / (param.max - param.min)) * 100;
  const defaultPercent = ((defaultVal - param.min) / (param.max - param.min)) * 100;

  const isNegative = param.isNegative === true;
  const accentColor = isNegative ? '#ef4444' : '#6366f1';
  const accentHover = isNegative ? '#dc2626' : '#4f46e5';

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-medium"
            style={{ color: isChanged ? accentColor : darkMode ? '#cbd5e1' : '#374151' }}
          >
            {param.label}
          </span>
          {isNegative && (
            <span className="text-xs px-1 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40">
              ⚠ Vyšší = horší
            </span>
          )}
          <button
            className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ?
          </button>
        </div>
        <div className="flex items-center gap-1">
          {isChanged && (
            <button
              className="text-xs hover:opacity-70"
              style={{ color: accentColor }}
              onClick={() => setParameter(param.key, defaultVal)}
              title="Resetovat na výchozí"
            >
              ↩
            </button>
          )}
          <span
            className="text-xs font-mono font-bold tabular-nums"
            style={{ color: isChanged ? accentColor : darkMode ? '#94a3b8' : '#6b7280' }}
          >
            {formatValue(value, param.format)}
          </span>
        </div>
      </div>

      {showTooltip && (
        <div className={`text-xs p-2 rounded mb-2 leading-relaxed ${darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-indigo-50 text-slate-600 border border-indigo-100'}`}>
          {param.description}
        </div>
      )}

      <div className="relative h-5 flex items-center">
        {/* Default marker */}
        <div
          className="absolute w-0.5 h-3 bg-slate-500 opacity-50 z-10 pointer-events-none"
          style={{ left: `${defaultPercent}%` }}
          title={`Výchozí: ${formatValue(defaultVal, param.format)}`}
        />
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={(e) => setParameter(param.key, Number(e.target.value))}
          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${isNegative ? 'system-slider-red' : 'system-slider-indigo'}`}
          style={{
            background: `linear-gradient(to right, ${isChanged ? accentColor : '#475569'} 0%, ${isChanged ? accentColor : '#475569'} ${percent}%, ${darkMode ? '#1e293b' : '#e2e8f0'} ${percent}%, ${darkMode ? '#1e293b' : '#e2e8f0'} 100%)`,
          }}
        />
      </div>

      <div className={`flex justify-between text-xs mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        <span>{formatValue(param.min, param.format)}</span>
        <span>{formatValue(param.max, param.format)}</span>
      </div>
    </div>
  );
}

export function SystemParametersPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const darkMode = useSimulationStore((s) => s.darkMode);

  return (
    <div
      className={`flex-shrink-0 border-t ${darkMode ? 'border-indigo-900/50' : 'border-indigo-200'}`}
      style={
        darkMode
          ? { background: 'linear-gradient(to right, #1a1033, #0f172a)' }
          : { background: '#f5f3ff' }
      }
    >
      {/* Header */}
      <button
        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
          darkMode ? 'hover:bg-indigo-950/40' : 'hover:bg-indigo-100/60'
        }`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-wider" style={{ color: '#a5b4fc' }}>
            ⚡ SYSTÉMOVÉ PARAMETRY SIMULACE
          </span>
          <span className={`text-xs ${darkMode ? 'text-indigo-400/70' : 'text-indigo-500/70'}`}>
            — mentální modely, paradigma, sensemaking (Donella Meadows)
          </span>
        </div>
        <span className={`text-xs ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
          {collapsed ? '▲' : '▼'}
        </span>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SYSTEM_PARAMETER_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-base">{group.icon}</span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: darkMode ? '#818cf8' : '#4f46e5' }}
                  >
                    {group.label}
                  </span>
                </div>
                {group.parameters.map((param) => (
                  <SystemSlider key={param.key} param={param} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .system-slider-indigo::-webkit-slider-thumb {
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #4338ca;
          box-shadow: 0 0 0 2px rgba(99,102,241,0.25);
        }
        .system-slider-indigo::-moz-range-thumb {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #4338ca;
        }
        .system-slider-red::-webkit-slider-thumb {
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #b91c1c;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.25);
        }
        .system-slider-red::-moz-range-thumb {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: 2px solid #b91c1c;
        }
      `}</style>
    </div>
  );
}
