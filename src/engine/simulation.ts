import { SimulationParameters, SimulationState, SprintMetrics } from './types';
import {
  computeEffectiveCapacity,
  computeDefectEscapeRate,
  computeTechDebtDelta,
  computeEnergyDelta,
  computeLearningDelta,
  computeSystemModifiers,
  applyDoubleLoopLearning,
} from './equations';
import { clamp, coefficientOfVariation, linearRegression } from '@/utils/math';

const INITIAL_STATE: SimulationState = {
  backlog_size: 30,
  wip_items: 8,
  done_items: 0,
  technical_debt: 20,
  team_energy: 80,
  knowledge_level: 40,
  defect_backlog: 5,
};

export function runSimulation(params: SimulationParameters, sprints = 52): SprintMetrics[] {
  const state = { ...INITIAL_STATE };
  const metrics: SprintMetrics[] = [];

  let toolingCumulativeLevel = 0;
  const throughputHistory: number[] = [];

  let currentParams = params;

  for (let sprint = 1; sprint <= sprints; sprint++) {
    // Apply double-loop learning every 4 sprints
    currentParams = applyDoubleLoopLearning(currentParams, sprint);

    toolingCumulativeLevel += currentParams.tooling_investment;

    // Compute system modifiers
    const sysMods = computeSystemModifiers(currentParams);

    // Build modified params with effective values for downstream computations
    const modifiedParams: SimulationParameters = {
      ...currentParams,
      requirements_clarity: sysMods.eff_requirements_clarity,
      scope_change_frequency: sysMods.eff_scope_change_frequency,
      psychological_safety: sysMods.eff_psychological_safety,
      retro_action_rate: sysMods.eff_retro_action_rate,
      test_automation: sysMods.eff_test_automation,
      code_review_thoroughness: sysMods.eff_code_review_thoroughness,
      definition_of_done_strictness: sysMods.eff_definition_of_done_strictness,
      planning_investment: sysMods.eff_planning_investment,
      stakeholder_engagement: sysMods.eff_stakeholder_engagement,
    };

    const effectiveCapacity = computeEffectiveCapacity(
      modifiedParams,
      state.team_energy,
      state.technical_debt,
      toolingCumulativeLevel,
      state.knowledge_level,
    );

    // Apply system modifiers to capacity
    const adjustedCapacity = effectiveCapacity
      * (1 - sysMods.context_switch_penalty)
      * (1 - sysMods.self_org_chaos_risk * 0.3 + sysMods.self_org_benefit * 0.15)
      * (1 - sysMods.planning_waste * 0.5);

    const defectEscapeRate = computeDefectEscapeRate(modifiedParams);

    // Apply complex defect multiplier
    const adjustedDefectRate = clamp(defectEscapeRate * sysMods.complex_defect_multiplier, 0.01, 0.8);

    // Pull from backlog into WIP, respecting effective WIP limit
    const available_wip_slots = Math.max(0, sysMods.eff_wip_limit - state.wip_items);
    const pull_rate = Math.min(state.backlog_size, available_wip_slots);
    state.backlog_size -= pull_rate;
    state.wip_items += pull_rate;

    // Complete work — bounded by WIP and adjusted capacity
    const potentialCompletion = adjustedCapacity / currentParams.avg_story_complexity;
    const completionRate = Math.min(state.wip_items, potentialCompletion);
    const reworkItems = completionRate * adjustedDefectRate;
    const actualCompleted = completionRate - reworkItems;

    state.wip_items = clamp(state.wip_items - completionRate + reworkItems, 0, 200);
    state.done_items += actualCompleted;

    // Stakeholder engagement (effective) affects requirements clarity effectively
    const stakeholderBoost = sysMods.eff_stakeholder_engagement / 100 * 0.2;
    const adjustedRequirementsClarity = clamp(sysMods.eff_requirements_clarity / 100 + stakeholderBoost, 0, 1);
    const reworkBack = reworkItems * (1 - adjustedRequirementsClarity);
    state.backlog_size += reworkBack;

    // New inflow — use effective inflow rate
    state.backlog_size += sysMods.eff_inflow_rate;

    // Tech debt
    const debtDelta = computeTechDebtDelta(modifiedParams, actualCompleted, adjustedCapacity, toolingCumulativeLevel);
    state.technical_debt = clamp(state.technical_debt + debtDelta, 0, 100);

    // Team energy — use modified params (effective psychological_safety, scope_change_frequency)
    const energyDelta = computeEnergyDelta(modifiedParams, state.team_energy, state.wip_items);
    state.team_energy = clamp(state.team_energy + energyDelta, 5, 100);

    // Knowledge — use modified params (effective retro_action_rate, psychological_safety)
    const learningDelta = computeLearningDelta(modifiedParams, state.knowledge_level);
    state.knowledge_level = clamp(state.knowledge_level + learningDelta, 0, 95);

    // Defect backlog
    const newDefects = reworkItems * 0.5;
    const defectsResolved = Math.min(state.defect_backlog, adjustedCapacity * 0.1);
    state.defect_backlog = clamp(state.defect_backlog + newDefects - defectsResolved, 0, 200);

    const throughput = Math.max(0, actualCompleted);
    throughputHistory.push(throughput);

    // Cycle time via Little's Law with self-org modifier
    const avgWip = clamp(state.wip_items, 0.1, 999);
    const cycleTimeModifier = 1 - sysMods.self_org_benefit * 0.2 + sysMods.self_org_chaos_risk * 0.3;
    const cycleTime = completionRate > 0
      ? (avgWip / completionRate) * (currentParams.sprint_length_days / 14) * cycleTimeModifier
      : currentParams.sprint_length_days;

    // Flow stability: inverse of coefficient of variation over last 6 sprints
    const recentThroughput = throughputHistory.slice(-6);
    const cv = coefficientOfVariation(recentThroughput);
    const flowStability = clamp(100 - cv * 100, 0, 100);

    // Velocity forecast: linear trend of last 8 sprints projected 4 sprints ahead
    const forecastWindow = throughputHistory.slice(-8);
    const { slope, intercept } = linearRegression(forecastWindow);
    const velocityForecast = clamp(intercept + slope * (forecastWindow.length + 4), 0, 500);

    // Composite Flow Score (0-100)
    const throughputNorm = clamp(throughput / (currentParams.team_size * 4), 0, 1) * 30;
    const energyNorm = (state.team_energy / 100) * 20;
    const debtNorm = (1 - state.technical_debt / 100) * 20;
    const stabilityNorm = (flowStability / 100) * 15;
    const defectNorm = (1 - adjustedDefectRate) * 15;
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
      defect_rate: Math.round(adjustedDefectRate * 100),
      flow_score: Math.round(flowScore),
      flow_stability: Math.round(flowStability),
      velocity_forecast: Math.round(velocityForecast * 10) / 10,
      wip_vs_limit: clamp(state.wip_items / currentParams.wip_limit, 0, 3),
      defect_backlog: Math.round(state.defect_backlog),
      effective_capacity: Math.round(adjustedCapacity * 10) / 10,
    });
  }

  return metrics;
}
