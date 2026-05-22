'use client';

import React, { useState } from 'react';
import { ParameterGroup as IParameterGroup } from '@/engine/types';
import { ParameterSlider } from './ParameterSlider';
import { useSimulationStore } from '@/store/simulationStore';
import { DEFAULT_PARAMETERS } from '@/engine/parameters';

interface Props {
  group: IParameterGroup;
}

export function ParameterGroup({ group }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const parameters = useSimulationStore((s) => s.parameters);
  const darkMode = useSimulationStore((s) => s.darkMode);

  const hasChanges = group.parameters.some((p) => parameters[p.key] !== DEFAULT_PARAMETERS[p.key]);

  return (
    <div className={`mb-3 rounded-lg border ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white/50'}`}>
      <button
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100/50'}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{group.icon}</span>
          <span className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {group.label}
          </span>
          {hasChanges && (
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" title="Parametry změněny" />
          )}
        </div>
        <span className={`text-xs transition-transform ${collapsed ? '' : 'rotate-180'} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          ▼
        </span>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3">
          {group.parameters.map((param) => (
            <ParameterSlider key={param.key} param={param} />
          ))}
        </div>
      )}
    </div>
  );
}
