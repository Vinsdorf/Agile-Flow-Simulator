import { SimulationParameters, SimulationState, SprintMetrics } from './types';
import {
  computeEffectiveCapacity,
  computeDefectEscapeRate,
  computeTechDebtDelta,
  computeEnergyDelta,
  computeLearningDelta,
} from './equations';
import { clamp, coefficientOfVariation, linearRegression } from '@/utils/math';

const SPRINTS = 52;

const INITIAL_STATE: SimulationState = {
  backlog_size: 30,
  wip_items: 8,
  done_items: 0,
  technical_debt: 20,
  team_energy: 80,
  knowledge_level: 40,
  defect_backlog: 5,
};

export function runSimulation(params: SimulationParameters): SprintMetrics[] {
  const state = { ...INITIAL_STATE };
  const metrics: SprintMetrics[] = [];

  let toolingCumulativeLevel = 0;
  const throughputHistory: number[] = [];

  for (let sprint = 1; sprint <= SPRINTS; sprint++) {
    toolingCumulativeLevel += params.tooling_investment;

    const effectiveCapacity = computeEffectiveCapacity(
      params,
      state.team_energy,
      state.technical_debt,
      toolingCumulativeLevel,
      state.knowledge_level,
    );

    const defectEscapeRate = computeDefectEscapeRate(params);

    // Pull from backlog into WIP, respecting WIP limit
    const available_wip_slots = Math.max(0, params.wip_limit - state.wip_items);
    const pull_rate = Math.min(state.backlog_size, available_wip_slots);
    state.backlog_size -= pull_rate;
    state.wip_items += pull_rate;

    // Complete work — bounded by WIP and capacity
    const potentialCompletion = effectiveCapacity / params.avg_story_complexity;
    const completionRate = Math.min(state.wip_items, potentialCompletion);
    const reworkItems = completionRate * defectEscapeRate;
    const actualCompleted = completionRate - reworkItems;

    state.wip_items = clamp(state.wip_items - completionRate + reworkItems, 0, 200);
    state.done_items += actualCompleted;

    // Stakeholder engagement affects requirements clarity effectively
    const stakeholderBoost = params.stakeholder_engagement / 100 * 0.2;
    const adjustedRequirementsClarity = clamp(params.requirements_clarity / 100 + stakeholderBoost, 0, 1);
    const reworkBack = reworkItems * (1 - adjustedRequirementsClarity);
    state.backlog_size += reworkBack;

    // New inflow
    state.backlog_size += params.inflow_rate_stories_per_sprint;

    // Tech debt
    const debtDelta = computeTechDebtDelta(params, actualCompleted, effectiveCapacity, toolingCumulativeLevel);
    state.technical_debt = clamp(state.technical_debt + debtDelta, 0, 100);

    // Team energy
    const energyDelta = computeEnergyDelta(params, state.team_energy, state.wip_items);
    state.team_energy = clamp(state.team_energy + energyDelta, 5, 100);

    // Knowledge
    const learningDelta = computeLearningDelta(params, state.knowledge_level);
    state.knowledge_level = clamp(state.knowledge_level + learningDelta, 0, 95);

    // Defect backlog
    const newDefects = reworkItems * 0.5;
    const defectsResolved = Math.min(state.defect_backlog, effectiveCapacity * 0.1);
    state.defect_backlog = clamp(state.defect_backlog + newDefects - defectsResolved, 0, 200);

    const throughput = Math.max(0, actualCompleted);
    throughputHistory.push(throughput);

    // Cycle time via Little's Law: avg WIP / completion rate, scaled by sprint length
    const avgWip = clamp(state.wip_items, 0.1, 999);
    const cycleTime = completionRate > 0
      ? (avgWip / completionRate) * (params.sprint_length_days / 14)
      : params.sprint_length_days;

    // Flow stability: inverse of coefficient of variation over last 6 sprints
    const recentThroughput = throughputHistory.slice(-6);
    const cv = coefficientOfVariation(recentThroughput);
    const flowStability = clamp(100 - cv * 100, 0, 100);

    // Velocity forecast: linear trend of last 8 sprints projected 4 sprints ahead
    const forecastWindow = throughputHistory.slice(-8);
    const { slope, intercept } = linearRegression(forecastWindow);
    const velocityForecast = clamp(intercept + slope * (forecastWindow.length + 4), 0, 500);

    // Composite Flow Score (0-100)
    const throughputNorm = clamp(throughput / (params.team_size * 4), 0, 1) * 30;
    const energyNorm = (state.team_energy / 100) * 20;
    const debtNorm = (1 - state.technical_debt / 100) * 20;
    const stabilityNorm = (flowStability / 100) * 15;
    const defectNorm = (1 - defectEscapeRate) * 15;
    const flowScore = clamp(throughputNorm + energyNorm + debtNorm + stabilityNorm + defectNorm, 0, 100);

    metrics.push({
      sprint,
      throughput,
      cycle_time: clamp(cycleTime, 0.1, 99),
      backlog_size: Math.round(state.backlog_size),
      wip_items: clamp(state.wip_items, 0, 999),
      done_items: Math.round(state.done_items),
      technical_debt: Math.round(state.technical_debt),
      team_energy: Math.round(state.team_energy),
      knowledge_level: Math.round(state.knowledge_level),
      defect_rate: Math.round(defectEscapeRate * 100),
      flow_score: Math.round(flowScore),
      flow_stability: Math.round(flowStability),
      velocity_forecast: Math.round(velocityForecast * 10) / 10,
      wip_vs_limit: clamp(state.wip_items / params.wip_limit, 0, 3),
      defect_backlog: Math.round(state.defect_backlog),
      effective_capacity: Math.round(effectiveCapacity * 10) / 10,
    });
  }

  return metrics;
}
