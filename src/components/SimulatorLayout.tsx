'use client';

import React, { useState } from 'react';
import { useSimulationStore, SPRINT_HORIZONS, SprintHorizon } from '@/store/simulationStore';
import { PARAMETER_GROUPS } from '@/engine/parameters';
import { ParameterGroup } from './ParameterPanel/ParameterGroup';
import { PresetSelector } from './ParameterPanel/PresetSelector';
import { FlowScoreGauge } from './Charts/FlowScoreGauge';
import { ThroughputChart } from './Charts/ThroughputChart';
import { CumulativeFlow } from './Charts/CumulativeFlow';
import { CycleTimeChart } from './Charts/CycleTimeChart';
import { TechDebtChart } from './Charts/TechDebtChart';
import { TeamEnergyChart } from './Charts/TeamEnergyChart';
import { FlowStabilityChart } from './Charts/FlowStabilityChart';
import { VelocityForecastChart } from './Charts/VelocityForecastChart';
import { ComparisonView } from './ComparisonView';
import { InsightsBar } from './InsightsBar';

const TABS = [
  { id: 'throughput', label: 'Throughput' },
  { id: 'cycletime', label: 'Cycle Time' },
  { id: 'debt', label: 'Tech Dluh' },
  { id: 'energy', label: 'Energie' },
  { id: 'stability', label: 'Stabilita' },
  { id: 'forecast', label: 'Prognóza' },
];

export function SimulatorLayout() {
  const { resetParameters, darkMode, toggleDarkMode, metrics, sprintHorizon, setSprintHorizon } = useSimulationStore();
  const activeTab = useSimulationStore((s) => s.activeTab);
  const setActiveTab = useSimulationStore((s) => s.setActiveTab);
  const [leftOpen, setLeftOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);

  const lastMetric = metrics[metrics.length - 1];

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* Header */}
      <header className={`flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b z-10 ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <button
            className={`p-1.5 rounded ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} text-sm`}
            onClick={() => setLeftOpen(!leftOpen)}
            title="Přepnout panel parametrů"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <h1 className={`text-base font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              AgileFlow Simulator
            </h1>
            <span className={`text-xs px-2 py-0.5 rounded-full hidden sm:block ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              System Dynamics
            </span>
            <button
              className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border transition-colors ${
                infoOpen
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : darkMode
                  ? 'border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'
                  : 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setInfoOpen(!infoOpen)}
              title="Zobrazit/skrýt popis simulace"
            >
              ?
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sprint horizon selector */}
          <div className={`flex items-center rounded-lg border overflow-hidden text-xs ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
            {SPRINT_HORIZONS.map((h) => (
              <button
                key={h}
                className={`px-2.5 py-1.5 transition-colors ${
                  sprintHorizon === h
                    ? 'bg-blue-600 text-white font-semibold'
                    : darkMode
                    ? 'text-slate-400 hover:bg-slate-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setSprintHorizon(h as SprintHorizon)}
                title={`Simulovat ${h} sprintů`}
              >
                {h}
              </button>
            ))}
          </div>

          {lastMetric && (
            <div className={`hidden md:flex items-center gap-3 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mr-2`}>
              <span>Sprint {lastMetric.sprint} | Score: <span className="font-bold text-blue-400">{lastMetric.flow_score}</span></span>
              <span>Energie: <span className={`font-bold ${lastMetric.team_energy < 30 ? 'text-red-400' : 'text-green-400'}`}>{lastMetric.team_energy}%</span></span>
              <span>Dluh: <span className={`font-bold ${lastMetric.technical_debt > 60 ? 'text-red-400' : 'text-yellow-400'}`}>{lastMetric.technical_debt}%</span></span>
            </div>
          )}
          <button
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
            onClick={resetParameters}
          >
            ↺ Reset
          </button>
          <button
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Info banner */}
      {infoOpen && (
        <div className={`flex-shrink-0 border-b px-4 py-3 ${darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex items-start justify-between gap-4 max-w-6xl">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-lg flex-shrink-0 mt-0.5">🔄</span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                  Simulátor systémové dynamiky agilního týmu
                </p>
                <p className={`text-xs leading-relaxed mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Pohybuj slidery vlevo a sleduj v reálném čase, jak rozhodnutí o týmu, procesech a technických praktikách ovlivňují
                  výkonnost za celý rok. Každá změna se okamžitě projeví ve všech grafech.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {[
                    { icon: '🏗️', text: 'Zkus přidat lidi do týmu — uvidíš Brooksův zákon v akci' },
                    { icon: '⚙️', text: 'Sniž WIP limit a sleduj, jak klesne cycle time (Little\'s Law)' },
                    { icon: '🔧', text: 'Nulové testy + nulový refaktoring = tech debt spirála' },
                    { icon: '🧠', text: 'Zapni přesčasy — krátkodobě pomůže, dlouhodobě tým vyhoří' },
                  ].map(({ icon, text }) => (
                    <span key={text} className={`flex items-start gap-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex-shrink-0">{icon}</span>
                      <span>{text}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 flex-shrink-0 mt-0.5">
              <span className={`text-xs hidden lg:block ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Začni výběrem scénáře ↙
              </span>
              <button
                className={`text-sm leading-none p-1 rounded hover:opacity-70 transition-opacity ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                onClick={() => setInfoOpen(false)}
                title="Zavřít (znovu otevřít tlačítkem ?)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel — Parameters */}
        {leftOpen && (
          <aside className={`w-72 flex-shrink-0 flex flex-col overflow-hidden border-r ${darkMode ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
            <div className="flex-1 overflow-y-auto p-3 space-y-0">
              <PresetSelector />
              <div className={`border-t pt-3 mb-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  PARAMETRY SIMULACE
                </p>
              </div>
              {PARAMETER_GROUPS.map((group) => (
                <ParameterGroup key={group.id} group={group} />
              ))}
              <div className={`border-t pt-3 mt-3 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <ComparisonView />
              </div>
            </div>
          </aside>
        )}

        {/* Right Panel — Charts */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Top row: Flow Score + Throughput + CFD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FlowScoreGauge />
              <ThroughputChart />
              <CumulativeFlow />
            </div>

            {/* Tab selector for detail charts */}
            <div className={`flex gap-1 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? darkMode
                        ? 'bg-slate-800 text-white border border-b-0 border-slate-600'
                        : 'bg-white text-slate-900 border border-b-0 border-slate-200 shadow-sm'
                      : darkMode
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Detail chart */}
            <div>
              {activeTab === 'throughput' && <ThroughputChart />}
              {activeTab === 'cycletime' && <CycleTimeChart />}
              {activeTab === 'debt' && <TechDebtChart />}
              {activeTab === 'energy' && <TeamEnergyChart />}
              {activeTab === 'stability' && <FlowStabilityChart />}
              {activeTab === 'forecast' && <VelocityForecastChart />}
            </div>
          </div>

          {/* Insights bar at bottom */}
          <InsightsBar />
        </main>
      </div>

      <style>{`
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }
        .slider-input::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
}
