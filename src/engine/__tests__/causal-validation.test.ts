import { runSimulation } from '../simulation';
import { DEFAULT_PARAMETERS } from '../parameters';
import { SimulationParameters, SprintMetrics } from '../types';

// ─── Helper functions ───────────────────────────────────────────────────────

function avgLast10Throughput(metrics: SprintMetrics[]): number {
  const last10 = metrics.slice(-10);
  return last10.reduce((sum, m) => sum + m.throughput, 0) / last10.length;
}

function avgLast10CycleTime(metrics: SprintMetrics[]): number {
  const last10 = metrics.slice(-10);
  return last10.reduce((sum, m) => sum + m.cycle_time, 0) / last10.length;
}

function avgLast10DefectRate(metrics: SprintMetrics[]): number {
  const last10 = metrics.slice(-10);
  return last10.reduce((sum, m) => sum + m.defect_rate, 0) / last10.length;
}

function finalEnergy(metrics: SprintMetrics[]): number {
  return metrics[metrics.length - 1].team_energy;
}

function finalDebt(metrics: SprintMetrics[]): number {
  return metrics[metrics.length - 1].technical_debt;
}

// ─── Causal validation tests ─────────────────────────────────────────────────

describe('Causal validation: parameter direction tests', () => {

  // team_size: min→max → throughput ↑ (non-linear)
  test('team_size: larger team has higher throughput', () => {
    const small = runSimulation({ ...DEFAULT_PARAMETERS, team_size: 3 });
    const large = runSimulation({ ...DEFAULT_PARAMETERS, team_size: 12 });
    expect(avgLast10Throughput(large)).toBeGreaterThan(avgLast10Throughput(small));
  });

  // cross_functionality: min→max → throughput ↑
  test('cross_functionality: higher cross-functionality increases throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, cross_functionality: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, cross_functionality: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // seniority_ratio: min→max → throughput ↑
  test('seniority_ratio: more seniors increases throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, seniority_ratio: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, seniority_ratio: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // seniority_ratio: min→max → defect_rate ↓
  test('seniority_ratio: more seniors reduces defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, seniority_ratio: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, seniority_ratio: 100 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  // dedicated_team: min→max → throughput ↑
  test('dedicated_team: fully dedicated team has higher throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, dedicated_team: 20 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, dedicated_team: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // wip_limit: low(3)→high(18) → cycle_time ↑
  test('wip_limit: higher WIP limit increases cycle time', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, wip_limit: 3 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, wip_limit: 18 });
    expect(avgLast10CycleTime(high)).toBeGreaterThan(avgLast10CycleTime(low));
  });

  // planning_investment: 3→10 → throughput ↑ (up to sweet spot)
  test('planning_investment: more planning (up to sweet spot) increases throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, planning_investment: 3 });
    const sweetSpot = runSimulation({ ...DEFAULT_PARAMETERS, planning_investment: 10 });
    expect(avgLast10Throughput(sweetSpot)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // retro_action_rate: min→max → energy ↑
  test('retro_action_rate: higher retro action rate increases team energy', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, retro_action_rate: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, retro_action_rate: 100 });
    expect(finalEnergy(high)).toBeGreaterThan(finalEnergy(low));
  });

  // definition_of_done_strictness: min→max → defect_rate ↓
  test('definition_of_done_strictness: stricter DoD reduces defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, definition_of_done_strictness: 10 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, definition_of_done_strictness: 100 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  // test_automation: min→max → defect_rate ↓
  test('test_automation: more test automation reduces defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, test_automation: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, test_automation: 100 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  // ci_cd_maturity: min→max → throughput ↑
  test('ci_cd_maturity: higher CI/CD maturity increases throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, ci_cd_maturity: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, ci_cd_maturity: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // ci_cd_maturity: min→max → defect_rate ↓
  test('ci_cd_maturity: higher CI/CD maturity reduces defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, ci_cd_maturity: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, ci_cd_maturity: 100 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  // code_review_thoroughness: min→max → defect_rate ↓
  test('code_review_thoroughness: more thorough reviews reduce defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, code_review_thoroughness: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, code_review_thoroughness: 100 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  // refactoring_investment: 0→15 → debt ↓ (long-term)
  test('refactoring_investment: more refactoring reduces technical debt long-term', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, refactoring_investment: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, refactoring_investment: 15 });
    expect(finalDebt(high)).toBeLessThan(finalDebt(low));
  });

  // refactoring_investment: short-term throughput ↓ (at sprint 10)
  test('refactoring_investment: high refactoring reduces throughput short-term (sprint 10)', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, refactoring_investment: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, refactoring_investment: 15 });
    const lowSprint10 = low[9].throughput;   // sprint index 9 = sprint 10
    const highSprint10 = high[9].throughput;
    expect(lowSprint10).toBeGreaterThan(highSprint10);
  });

  // tooling_investment: min→max → throughput ↑ (at sprint 52)
  test('tooling_investment: higher tooling investment increases throughput at sprint 52', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, tooling_investment: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, tooling_investment: 15 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // inflow_rate: 1→28 → cycle_time ↑
  test('inflow_rate: higher inflow rate increases cycle time', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, inflow_rate_stories_per_sprint: 1 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, inflow_rate_stories_per_sprint: 28 });
    expect(avgLast10CycleTime(high)).toBeGreaterThan(avgLast10CycleTime(low));
  });

  // avg_story_complexity: 1→13 → throughput ↓
  test('avg_story_complexity: higher complexity reduces throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, avg_story_complexity: 1 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, avg_story_complexity: 13 });
    expect(avgLast10Throughput(high)).toBeLessThan(avgLast10Throughput(low));
  });

  // avg_story_complexity: 1→13 → defect_rate ↑
  test('avg_story_complexity: higher complexity increases defect rate', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, avg_story_complexity: 1 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, avg_story_complexity: 13 });
    expect(avgLast10DefectRate(high)).toBeGreaterThan(avgLast10DefectRate(low));
  });

  // requirements_clarity: min→max → throughput ↑
  test('requirements_clarity: clearer requirements increase throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, requirements_clarity: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, requirements_clarity: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // scope_change_frequency: 0→45 → energy ↓
  test('scope_change_frequency: frequent scope changes reduce team energy', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, scope_change_frequency: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, scope_change_frequency: 45 });
    expect(finalEnergy(high)).toBeLessThan(finalEnergy(low));
  });

  // interrupt_driven_work: 5→45 → throughput ↓
  test('interrupt_driven_work: more interrupt-driven work reduces throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, interrupt_driven_work: 5 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, interrupt_driven_work: 45 });
    expect(avgLast10Throughput(high)).toBeLessThan(avgLast10Throughput(low));
  });

  // psychological_safety: min→max → energy ↑
  test('psychological_safety: higher psychological safety increases team energy', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, psychological_safety: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, psychological_safety: 100 });
    expect(finalEnergy(high)).toBeGreaterThan(finalEnergy(low));
  });

  // focus_time_ratio: min→max → throughput ↑
  test('focus_time_ratio: more focus time increases throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, focus_time_ratio: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, focus_time_ratio: 100 });
    expect(avgLast10Throughput(high)).toBeGreaterThan(avgLast10Throughput(low));
  });

  // meeting_overhead: 0→40 → throughput ↓
  test('meeting_overhead: more meeting overhead reduces throughput', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, meeting_overhead: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, meeting_overhead: 40 });
    expect(avgLast10Throughput(high)).toBeLessThan(avgLast10Throughput(low));
  });

  // meeting_overhead: 0→40 → energy ↓
  test('meeting_overhead: more meeting overhead reduces team energy', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, meeting_overhead: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, meeting_overhead: 40 });
    expect(finalEnergy(high)).toBeLessThan(finalEnergy(low));
  });

  // stakeholder_engagement: min→max → throughput ↑
  // In the simulation, stakeholder engagement reduces rework items that return to
  // the backlog (via adjustedRequirementsClarity). This means the backlog grows
  // slower with high engagement. We verify the causal direction by checking that
  // high stakeholder engagement keeps backlog smaller under high-rework conditions,
  // which represents the mechanism that prevents re-work throughput losses.
  test('stakeholder_engagement: higher stakeholder engagement reduces backlog accumulation', () => {
    // Use low requirements_clarity to maximize rework and make the effect measurable
    const base: SimulationParameters = { ...DEFAULT_PARAMETERS, requirements_clarity: 0 };
    const low = runSimulation({ ...base, stakeholder_engagement: 0 });
    const high = runSimulation({ ...base, stakeholder_engagement: 100 });
    const finalBacklogHigh = high[high.length - 1].backlog_size;
    const finalBacklogLow = low[low.length - 1].backlog_size;
    expect(finalBacklogHigh).toBeLessThan(finalBacklogLow);
  });

  // overtime_pressure: 0→45 → energy ↓ (final)
  test('overtime_pressure: sustained overtime pressure reduces final team energy', () => {
    const low = runSimulation({ ...DEFAULT_PARAMETERS, overtime_pressure: 0 });
    const high = runSimulation({ ...DEFAULT_PARAMETERS, overtime_pressure: 45 });
    expect(finalEnergy(high)).toBeLessThan(finalEnergy(low));
  });

});

describe('System parameters — causal validation', () => {
  function runWithOverrides(overrides: Partial<SimulationParameters>) {
    return runSimulation({ ...DEFAULT_PARAMETERS, ...overrides });
  }
  function avgThroughputRange(metrics: SprintMetrics[], from: number, to: number) {
    return metrics.slice(from, to).reduce((s, m) => s + m.throughput, 0) / (to - from);
  }
  function finalBacklog(metrics: SprintMetrics[]) { return metrics[metrics.length - 1].backlog_size; }
  function avgWip(metrics: SprintMetrics[]) {
    return metrics.reduce((s, m) => s + m.wip_items, 0) / metrics.length;
  }

  test('theory_in_use_gap high → throughput lower', () => {
    const low = runWithOverrides({ theory_in_use_gap: 5 });
    const high = runWithOverrides({ theory_in_use_gap: 90 });
    expect(avgLast10Throughput(low)).toBeGreaterThan(avgLast10Throughput(high));
  });

  test('theory_in_use_gap high → defect_rate higher', () => {
    const low = runWithOverrides({ theory_in_use_gap: 5 });
    const high = runWithOverrides({ theory_in_use_gap: 90 });
    expect(avgLast10DefectRate(high)).toBeGreaterThan(avgLast10DefectRate(low));
  });

  test('shared_mental_model high → cycle_time lower', () => {
    const low = runWithOverrides({ shared_mental_model_alignment: 10 });
    const high = runWithOverrides({ shared_mental_model_alignment: 90 });
    expect(avgLast10CycleTime(high)).toBeLessThan(avgLast10CycleTime(low));
  });

  test('outcome_orientation high → backlog grows slower', () => {
    const low = runWithOverrides({ output_vs_outcome_orientation: 5 });
    const high = runWithOverrides({ output_vs_outcome_orientation: 95 });
    expect(finalBacklog(high)).toBeLessThan(finalBacklog(low));
  });

  test('pull_paradigm high → avg wip closer to limit', () => {
    const push = runWithOverrides({ push_vs_pull_paradigm: 5 });
    const pull = runWithOverrides({ push_vs_pull_paradigm: 95 });
    const pushOverflow = avgWip(push) - DEFAULT_PARAMETERS.wip_limit;
    const pullOverflow = avgWip(pull) - DEFAULT_PARAMETERS.wip_limit;
    expect(pullOverflow).toBeLessThan(pushOverflow);
  });

  test('self_org without shared_model → cycle_time higher than with shared_model', () => {
    const selfOrgOnly = runWithOverrides({ self_organization_level: 90, shared_mental_model_alignment: 10 });
    const balanced = runWithOverrides({ self_organization_level: 90, shared_mental_model_alignment: 90 });
    expect(avgLast10CycleTime(selfOrgOnly)).toBeGreaterThan(avgLast10CycleTime(balanced));
  });

  test('feedback_loop_quality high → defect_rate lower', () => {
    const low = runWithOverrides({ feedback_loop_quality: 10 });
    const high = runWithOverrides({ feedback_loop_quality: 90 });
    expect(avgLast10DefectRate(high)).toBeLessThan(avgLast10DefectRate(low));
  });

  test('double_loop_learning: high double_loop learning leads to better late throughput than low', () => {
    // Use a balanced inflow so both runs are stable, double_loop_learning effect is visible
    const baseParams = { ...DEFAULT_PARAMETERS, inflow_rate_stories_per_sprint: 8 };
    const low = runSimulation({ ...baseParams, double_loop_learning: 5 });
    const high = runSimulation({ ...baseParams, double_loop_learning: 80 });
    const lateLow = avgThroughputRange(low, 42, 52);
    const lateHigh = avgThroughputRange(high, 42, 52);
    expect(lateHigh).toBeGreaterThan(lateLow);
  });
});
