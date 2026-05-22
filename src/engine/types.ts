export interface SimulationParameters {
  // Team structure
  team_size: number;
  cross_functionality: number;
  seniority_ratio: number;
  dedicated_team: number;

  // Process settings
  wip_limit: number;
  sprint_length_days: number;
  planning_investment: number;
  retro_action_rate: number;
  definition_of_done_strictness: number;

  // Technical practices
  test_automation: number;
  ci_cd_maturity: number;
  code_review_thoroughness: number;
  refactoring_investment: number;
  tooling_investment: number;

  // Work & requirements
  inflow_rate_stories_per_sprint: number;
  avg_story_complexity: number;
  requirements_clarity: number;
  scope_change_frequency: number;
  interrupt_driven_work: number;

  // Human factors
  psychological_safety: number;
  focus_time_ratio: number;
  meeting_overhead: number;
  stakeholder_engagement: number;
  overtime_pressure: number;
}

export interface SimulationState {
  backlog_size: number;
  wip_items: number;
  done_items: number;
  technical_debt: number;
  team_energy: number;
  knowledge_level: number;
  defect_backlog: number;
}

export interface SprintMetrics {
  sprint: number;
  throughput: number;
  cycle_time: number;
  backlog_size: number;
  wip_items: number;
  done_items: number;
  technical_debt: number;
  team_energy: number;
  knowledge_level: number;
  defect_rate: number;
  flow_score: number;
  flow_stability: number;
  velocity_forecast: number;
  wip_vs_limit: number;
  defect_backlog: number;
  effective_capacity: number;
}

export type ParameterFormat = 'percent' | 'number' | 'days';

export interface ParameterDefinition {
  key: keyof SimulationParameters;
  label: string;
  description: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit?: string;
  format: ParameterFormat;
}

export interface ParameterGroup {
  id: string;
  label: string;
  icon: string;
  parameters: ParameterDefinition[];
}

export interface Preset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  parameters: SimulationParameters;
}
