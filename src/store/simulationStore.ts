'use client';

import { create } from 'zustand';
import { SimulationParameters, SprintMetrics } from '@/engine/types';
import { DEFAULT_PARAMETERS } from '@/engine/parameters';
import { runSimulation } from '@/engine/simulation';
import { generateInsights } from '@/engine/insights';

interface Snapshot {
  id: string;
  label: string;
  parameters: SimulationParameters;
  metrics: SprintMetrics[];
}

interface SimulationStore {
  parameters: SimulationParameters;
  metrics: SprintMetrics[];
  insights: ReturnType<typeof generateInsights>;
  snapshots: Snapshot[];
  comparisonSnapshot: Snapshot | null;
  activeTab: string;
  darkMode: boolean;

  setParameter: (key: keyof SimulationParameters, value: number) => void;
  setPreset: (parameters: SimulationParameters) => void;
  resetParameters: () => void;
  saveSnapshot: (label: string) => void;
  setComparisonSnapshot: (snapshot: Snapshot | null) => void;
  removeSnapshot: (id: string) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
}

function computeState(params: SimulationParameters) {
  const metrics = runSimulation(params);
  const insights = generateInsights(params, metrics);
  return { metrics, insights };
}

export const useSimulationStore = create<SimulationStore>((set, get) => {
  const initialParams = DEFAULT_PARAMETERS as SimulationParameters;
  const { metrics, insights } = computeState(initialParams);

  return {
    parameters: initialParams,
    metrics,
    insights,
    snapshots: [],
    comparisonSnapshot: null,
    activeTab: 'throughput',
    darkMode: true,

    setParameter: (key, value) => {
      const params = { ...get().parameters, [key]: value };
      const { metrics, insights } = computeState(params);
      set({ parameters: params, metrics, insights });
    },

    setPreset: (parameters) => {
      const { metrics, insights } = computeState(parameters);
      set({ parameters, metrics, insights });
    },

    resetParameters: () => {
      const params = DEFAULT_PARAMETERS as SimulationParameters;
      const { metrics, insights } = computeState(params);
      set({ parameters: params, metrics, insights });
    },

    saveSnapshot: (label) => {
      const { parameters, metrics } = get();
      const snapshot: Snapshot = {
        id: Date.now().toString(),
        label,
        parameters: { ...parameters },
        metrics: [...metrics],
      };
      set((state) => ({ snapshots: [...state.snapshots.slice(-4), snapshot] }));
    },

    setComparisonSnapshot: (snapshot) => {
      set({ comparisonSnapshot: snapshot });
    },

    removeSnapshot: (id) => {
      set((state) => ({
        snapshots: state.snapshots.filter((s) => s.id !== id),
        comparisonSnapshot: state.comparisonSnapshot?.id === id ? null : state.comparisonSnapshot,
      }));
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  };
});
