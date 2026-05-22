'use client';

import React from 'react';
import { PRESETS } from '@/engine/presets';
import { useSimulationStore } from '@/store/simulationStore';

export function PresetSelector() {
  const setPreset = useSimulationStore((s) => s.setPreset);
  const darkMode = useSimulationStore((s) => s.darkMode);
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <div className="mb-4">
      <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        PŘEDNASTAVENÉ SCÉNÁŘE
      </p>
      <div className="flex flex-col gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`text-left px-3 py-2 rounded-lg text-xs transition-all border ${
              active === preset.id
                ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                : darkMode
                ? 'border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-700/50'
                : 'border-slate-200 hover:border-slate-400 text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => {
              setActive(preset.id);
              setPreset(preset.parameters);
            }}
          >
            <span className="mr-1.5">{preset.emoji}</span>
            <span className="font-medium">{preset.label}</span>
            <span className={`block mt-0.5 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {preset.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
