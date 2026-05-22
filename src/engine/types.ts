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

  // System parameters (meta-layer)
  shared_mental_model_alignment: number;  // 0-100
  theory_in_use_gap: number;              // 0-100
  failure_perception: number;             // 0-100
  output_vs_outcome_orientation: number;  // 0-100
  push_vs_pull_paradigm: number;          // 0-100
  predictive_vs_adaptive_planning: number;// 0-100
  self_organization_level: number;        // 0-100
  complexity_awareness: number;           // 0-100
  feedback_loop_quality: number;          // 0-100
  double_loop_learning: number;           // 0-100
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
  isNegative?: boolean;
  isSystem?: boolean;
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
