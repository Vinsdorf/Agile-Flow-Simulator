'use client';

import React, { useState } from 'react';
import { ParameterDefinition } from '@/engine/types';
import { useSimulationStore } from '@/store/simulationStore';
import { DEFAULT_PARAMETERS } from '@/engine/parameters';

function formatValue(value: number, format: ParameterDefinition['format']): string {
  if (format === 'percent') return `${value}%`;
  if (format === 'days') return `${value} dní`;
  return `${value}`;
}

interface Props {
  param: ParameterDefinition;
}

export function ParameterSlider({ param }: Props) {
  const value = useSimulationStore((s) => s.parameters[param.key]);
  const setParameter = useSimulationStore((s) => s.setParameter);
  const darkMode = useSimulationStore((s) => s.darkMode);
  const [showTooltip, setShowTooltip] = useState(false);

  const defaultVal = DEFAULT_PARAMETERS[param.key];
  const isChanged = value !== defaultVal;
  const percent = ((value - param.min) / (param.max - param.min)) * 100;
  const defaultPercent = ((defaultVal - param.min) / (param.max - param.min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} ${isChanged ? 'text-blue-400' : ''}`}>
            {param.label}
          </span>
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
              className="text-xs text-blue-400 hover:text-blue-300"
              onClick={() => setParameter(param.key, defaultVal)}
              title="Resetovat na výchozí"
            >
              ↩
            </button>
          )}
          <span className={`text-xs font-mono font-bold tabular-nums ${isChanged ? 'text-blue-400' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatValue(value, param.format)}
          </span>
        </div>
      </div>

      {showTooltip && (
        <div className={`text-xs p-2 rounded mb-2 leading-relaxed ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
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
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-input"
          style={{
            background: `linear-gradient(to right, ${isChanged ? '#3b82f6' : '#475569'} 0%, ${isChanged ? '#3b82f6' : '#475569'} ${percent}%, ${darkMode ? '#1e293b' : '#e2e8f0'} ${percent}%, ${darkMode ? '#1e293b' : '#e2e8f0'} 100%)`,
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
