import { SimulationParameters } from './types';
import { clamp } from '@/utils/math';

// Tuneable constants — extracted for easy tweaking
export const CONSTANTS = {
  base_productivity_per_person: 8,    // story points per person per sprint baseline
  base_defect_rate: 0.18,             // 18% base defect escape rate
  base_recovery_rate: 3,              // energy recovery per sprint
  energy_crash_threshold: 30,         // below this, productivity collapses
  debt_drag_start: 40,                // above this, debt starts slowing delivery
  debt_drag_max: 0.6,                 // max 60% slow-down from debt
  planning_sweet_spot: 10,            // optimal planning investment %
  tooling_cumulative_factor: 0.003,   // tooling compounds over time
  knowledge_max: 95,                  // knowledge asymptotically caps here
  sprint_ceremony_overhead: 0.05,     // 5% fixed ceremony cost
};

// Brooks's Law: communication overhead = n*(n-1)/2 links, normalized
export function communicationOverhead(teamSize: number): number {
  const links = (teamSize * (teamSize - 1)) / 2;
  const normalized = links / ((12 * 11) / 2); // normalize to max team size
  return clamp(normalized * 0.35, 0, 0.35);   // caps at 35% overhead
}

// Energy multiplier — sharp drop below threshold (burnout cliff)
export function energyMultiplier(teamEnergy: number): number {
  if (teamEnergy < CONSTANTS.energy_crash_threshold) {
    return clamp(teamEnergy / CONSTANTS.energy_crash_threshold * 0.5, 0.1, 0.5);
  }
  return clamp(0.5 + (teamEnergy - CONSTANTS.energy_crash_threshold) / 140, 0.5, 1.1);
}

// Focus multiplier — diminishing returns from focus time
export function focusMultiplier(focusTimeRatio: number): number {
  return clamp(0.5 + (focusTimeRatio / 100) * 0.7, 0.5, 1.2);
}

// Seniority affects quality and speed
export function seniorityMultiplier(seniorityRatio: number): number {
  return clamp(0.75 + (seniorityRatio / 100) * 0.5, 0.75, 1.25);
}

// Technical debt drags velocity — exponential above threshold
export function technicalDebtDrag(technicalDebt: number): number {
  if (technicalDebt <= CONSTANTS.debt_drag_start) {
    return (technicalDebt / CONSTANTS.debt_drag_start) * 0.1;
  }
  const excess = (technicalDebt - CONSTANTS.debt_drag_start) / (100 - CONSTANTS.debt_drag_start);
  return clamp(0.1 + excess * CONSTANTS.debt_drag_max, 0.1, CONSTANTS.debt_drag_max + 0.1);
}

// Planning has a sweet spot — too little or too much is bad
export function planningMultiplier(planningInvestment: number): number {
  const sweet = CONSTANTS.planning_sweet_spot;
  if (planningInvestment < sweet) {
    return clamp(0.7 + (planningInvestment / sweet) * 0.3, 0.7, 1.0);
  }
  // Diminishing returns above sweet spot
  const excess = (planningInvestment - sweet) / (30 - sweet);
  return clamp(1.0 - excess * 0.2, 0.8, 1.0);
}

// Cross-functionality reduces bottlenecks
export function crossFunctionalityMultiplier(crossFunctionality: number): number {
  return clamp(0.75 + (crossFunctionality / 100) * 0.3, 0.75, 1.05);
}

export function computeEffectiveCapacity(
  params: SimulationParameters,
  teamEnergy: number,
  technicalDebt: number,
  toolingCumulativeLevel: number,
  knowledgeLevel: number,
): number {
  const {
    team_size,
    meeting_overhead,
    interrupt_driven_work,
    focus_time_ratio,
    dedicated_team,
    seniority_ratio,
    planning_investment,
    cross_functionality,
    overtime_pressure,
    ci_cd_maturity,
    refactoring_investment,
    definition_of_done_strictness,
    code_review_thoroughness,
    sprint_length_days,
  } = params;

  const baseCapacity = team_size * CONSTANTS.base_productivity_per_person;
  const toolingBoost = 1 + Math.min(toolingCumulativeLevel * CONSTANTS.tooling_cumulative_factor, 0.3);
  const overtimeBoost = 1 + (overtime_pressure / 100) * 0.3; // short-term boost

  // Fix 3: sprint_length_days — shorter sprints = more ceremony overhead per unit of work
  const sprintLengthFactor = clamp(1.0 - (sprint_length_days - 14) / 140, 0.9, 1.0);

  const capacity =
    baseCapacity
    * (1 - meeting_overhead / 100)
    * (1 - interrupt_driven_work / 100)
    * focusMultiplier(focus_time_ratio)
    * energyMultiplier(teamEnergy)
    * (1 - communicationOverhead(team_size))
    * (dedicated_team / 100)
    * seniorityMultiplier(seniority_ratio)
    * planningMultiplier(planning_investment)
    * crossFunctionalityMultiplier(cross_functionality)
    * (1 - technicalDebtDrag(technicalDebt))
    * (1 - CONSTANTS.sprint_ceremony_overhead)
    * toolingBoost
    * overtimeBoost
    * (1 + (ci_cd_maturity / 100) * 0.25)            // Fix 1: up to +25% capacity from CI/CD
    * (1 + (knowledgeLevel / 100) * 0.15)             // Fix 2: up to +15% from team knowledge
    * sprintLengthFactor                               // Fix 3: sprint ceremony overhead
    * (1 - refactoring_investment / 100)              // Fix 5: refactoring diverts capacity from features
    * (1 - (definition_of_done_strictness / 100) * 0.08)  // Fix 9: max -8% from strict DoD
    * (1 - (code_review_thoroughness / 100) * 0.06); // Fix 10: max -6% from thorough reviews

  return clamp(capacity, 1, 200);
}

export function computeDefectEscapeRate(params: SimulationParameters): number {
  const {
    test_automation,
    code_review_thoroughness,
    requirements_clarity,
    scope_change_frequency,
    definition_of_done_strictness,
    ci_cd_maturity,
    seniority_ratio,
    avg_story_complexity,
  } = params;

  // DoD strictness must be > 0 to avoid division issues
  const dodFactor = clamp(definition_of_done_strictness / 100, 0.1, 1.0);

  const rate =
    CONSTANTS.base_defect_rate
    * (1 - (test_automation / 100) * 0.6)
    * (1 - (code_review_thoroughness / 100) * 0.3)
    * (1 - (requirements_clarity / 100) * 0.4)
    * (1 + (scope_change_frequency / 100) * 0.5)
    / dodFactor
    * (1 - (ci_cd_maturity / 100) * 0.2)             // Fix 1: up to -20% defects from CI/CD
    * (1 - (seniority_ratio / 100) * 0.25)           // Fix 4: up to -25% defects from senior devs
    * (1 + Math.max(0, (avg_story_complexity - 3) / 10) * 0.3); // Fix 6: complex stories produce more defects

  return clamp(rate, 0.01, 0.8);
}

export function computeTechDebtDelta(
  params: SimulationParameters,
  throughput: number,
  effectiveCapacity: number,
  toolingCumulativeLevel: number,
): number {
  const { test_automation, overtime_pressure, code_review_thoroughness, refactoring_investment } = params;
  const toolingEffect = Math.min(toolingCumulativeLevel * 0.001, 0.1);

  const accumulation =
    (1 - test_automation / 100) * throughput * 0.3
    + (overtime_pressure / 100) * 0.5 * 10
    + (1 - code_review_thoroughness / 100) * 0.2 * 10;

  const repayment =
    (refactoring_investment / 100) * effectiveCapacity * 0.5
    + toolingEffect * 2;

  return clamp(accumulation - repayment, -5, 5);
}

export function computeEnergyDelta(
  params: SimulationParameters,
  teamEnergy: number,
  wipItems: number,
): number {
  const {
    overtime_pressure,
    wip_limit,
    psychological_safety,
    retro_action_rate,
    scope_change_frequency,
    meeting_overhead,
    inflow_rate_stories_per_sprint,
  } = params;

  const overloadPenalty = wipItems > wip_limit * 1.5 ? 3 : 0;
  const scopeEffect = scope_change_frequency < 10 ? 1 : -(scope_change_frequency / 100) * 8;
  const naturalRecovery = CONSTANTS.base_recovery_rate * (1 - teamEnergy / 100);

  return clamp(
    -(overtime_pressure / 100) * 15
    - overloadPenalty
    + (psychological_safety / 100) * 1.5
    + (retro_action_rate / 100) * 0.5
    + scopeEffect
    + naturalRecovery
    - (meeting_overhead / 100) * 3                                          // Fix 7: up to -3 energy/sprint from meetings
    - Math.max(0, (inflow_rate_stories_per_sprint - 12) / 20) * 2,         // Fix 8: high inflow pressure
    -10, 6
  );
}

export function computeLearningDelta(
  params: SimulationParameters,
  knowledgeLevel: number,
): number {
  const { retro_action_rate, psychological_safety, seniority_ratio, cross_functionality } = params;
  const diminishingReturns = 1 - knowledgeLevel / 100;

  return clamp(
    (
      (retro_action_rate / 100) * 1.0
      + (psychological_safety / 100) * 0.5
      + (seniority_ratio / 100) * 0.5
      + (cross_functionality / 100) * 0.3
    ) * diminishingReturns,
    0, 3
  );
}

export interface SystemModifiers {
  // effective versions of existing params
  eff_definition_of_done_strictness: number;
  eff_code_review_thoroughness: number;
  eff_retro_action_rate: number;
  eff_planning_investment: number;
  eff_test_automation: number;
  eff_requirements_clarity: number;
  eff_scope_change_frequency: number;
  eff_cross_functionality: number;
  eff_psychological_safety: number;
  eff_inflow_rate: number;
  eff_wip_limit: number;               // effective WIP considering push/pull
  eff_stakeholder_engagement: number;
  // computed modifiers for capacity/cycle time
  context_switch_penalty: number;      // 0-0.2
  self_org_benefit: number;            // 0-1
  self_org_chaos_risk: number;         // 0-0.5
  planning_efficiency_multiplier: number; // 0.6-1.4
  complex_defect_multiplier: number;   // 1.0-1.2
  planning_waste: number;              // 0-0.12 (fraction of planning that's wasted)
}

export function computeSystemModifiers(params: SimulationParameters): SystemModifiers {
  const {
    theory_in_use_gap,
    shared_mental_model_alignment,
    failure_perception,
    output_vs_outcome_orientation,
    push_vs_pull_paradigm,
    predictive_vs_adaptive_planning,
    self_organization_level,
    complexity_awareness,
    feedback_loop_quality,
    team_size,
  } = params;

  // Theory-in-use gap: degrades ALL process param effectiveness
  const process_effectiveness = 1 - (theory_in_use_gap / 100) * 0.7; // gap 100% → 30% effectiveness

  // Shared mental model boosts requirements, reduces scope churn, improves cross-func
  const mental_model_factor = shared_mental_model_alignment / 100;

  // Failure perception → psychological safety, learning visibility
  const failure_culture = failure_perception / 100;

  // Output vs outcome → filters inflow, clarifies requirements
  const outcome_factor = output_vs_outcome_orientation / 100;

  // Push vs pull → WIP limit effectiveness, context switching
  const pull_factor = push_vs_pull_paradigm / 100;
  const wip_limit_effectiveness = 0.3 + pull_factor * 0.7;
  const context_switch_penalty = (1 - pull_factor) * 0.2;

  // Adaptive planning → planning efficiency
  const adaptive_factor = predictive_vs_adaptive_planning / 100;
  const planning_efficiency_multiplier = adaptive_factor > 0.5
    ? 1.0 + (adaptive_factor - 0.5) * 0.4
    : 0.6 + adaptive_factor * 0.8;

  // Self-organization: benefit requires shared mental model; without it → chaos
  const self_org_factor = self_organization_level / 100;
  const self_org_chaos_risk = Math.max(0, self_org_factor - mental_model_factor) * 0.5;
  const self_org_benefit = self_org_factor * mental_model_factor;

  // Complexity awareness (Cynefin): ~40% of stories are complex
  const cynefin_factor = complexity_awareness / 100;
  const complex_story_ratio = 0.4;
  const planning_waste = complex_story_ratio * (1 - cynefin_factor) * 0.3;
  const complex_defect_multiplier = 1 + complex_story_ratio * (1 - cynefin_factor) * 0.5;

  // Feedback loop quality: amplifier for all feedback mechanisms
  const feedback_quality = feedback_loop_quality / 100;

  // Compute effective parameters
  const eff_definition_of_done_strictness = params.definition_of_done_strictness * process_effectiveness;
  const eff_code_review = params.code_review_thoroughness * process_effectiveness * (0.5 + feedback_quality * 0.5);
  const eff_retro = params.retro_action_rate * process_effectiveness * (0.4 + feedback_quality * 0.6);
  const eff_planning = params.planning_investment * process_effectiveness * planning_efficiency_multiplier * (1 - planning_waste);
  const eff_test_automation = params.test_automation * process_effectiveness * (0.6 + feedback_quality * 0.4);

  const eff_requirements_clarity = clamp(
    params.requirements_clarity + mental_model_factor * 30 + outcome_factor * 20,
    0, 100
  );
  const eff_scope_change = params.scope_change_frequency
    * (1 - mental_model_factor * 0.4)
    * (1 - outcome_factor * 0.3);

  const eff_cross_functionality = clamp(params.cross_functionality + mental_model_factor * 20, 0, 100);
  const eff_psychological_safety = clamp(params.psychological_safety + failure_culture * 25, 0, 100);

  const eff_inflow = params.inflow_rate_stories_per_sprint * (1 - outcome_factor * 0.4);

  // In push system, effective WIP exceeds the stated limit
  const eff_wip_limit = params.wip_limit + (1 - wip_limit_effectiveness) * team_size * 0.5;

  const eff_stakeholder = params.stakeholder_engagement * (0.3 + feedback_quality * 0.7);

  return {
    eff_definition_of_done_strictness,
    eff_code_review_thoroughness: eff_code_review,
    eff_retro_action_rate: eff_retro,
    eff_planning_investment: eff_planning,
    eff_test_automation,
    eff_requirements_clarity,
    eff_scope_change_frequency: eff_scope_change,
    eff_cross_functionality,
    eff_psychological_safety,
    eff_inflow_rate: eff_inflow,
    eff_wip_limit,
    eff_stakeholder_engagement: eff_stakeholder,
    context_switch_penalty,
    self_org_benefit,
    self_org_chaos_risk,
    planning_efficiency_multiplier,
    complex_defect_multiplier,
    planning_waste,
  };
}

export function applyDoubleLoopLearning(params: SimulationParameters, sprint: number): SimulationParameters {
  if (sprint % 4 !== 0 || sprint === 0) return params;
  const improvement = (params.double_loop_learning / 100) * 2;
  const tunable: Array<{ key: keyof SimulationParameters; optimal: number }> = [
    { key: 'test_automation', optimal: 80 },
    { key: 'ci_cd_maturity', optimal: 80 },
    { key: 'code_review_thoroughness', optimal: 70 },
    { key: 'retro_action_rate', optimal: 70 },
    { key: 'refactoring_investment', optimal: 10 },
  ];
  type Candidate = { key: keyof SimulationParameters; optimal: number; val: number; gap: number };
  const weakest = tunable.reduce<Candidate>((worst, p) => {
    const val = params[p.key] as number;
    const gap = Math.abs(p.optimal - val) / p.optimal;
    return gap > worst.gap ? { key: p.key, optimal: p.optimal, val, gap } : worst;
  }, { key: '' as keyof SimulationParameters, optimal: 0, val: 0, gap: -1 });
  if (weakest.key && weakest.gap > 0.1) {
    const val = params[weakest.key] as number;
    const direction = weakest.optimal > val ? 1 : -1;
    return { ...params, [weakest.key]: clamp(val + direction * improvement, 0, 100) };
  }
  return params;
}
