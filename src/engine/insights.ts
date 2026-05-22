import { SimulationParameters, SprintMetrics } from './types';

interface Insight {
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
}

export function generateInsights(
  params: SimulationParameters,
  metrics: SprintMetrics[],
): Insight[] {
  if (metrics.length === 0) return [];

  const insights: Insight[] = [];
  const last = metrics[metrics.length - 1];
  const mid = metrics[Math.floor(metrics.length / 2)];

  // Flow score trend
  const scoreChange = last.flow_score - mid.flow_score;
  if (scoreChange > 10) {
    insights.push({ text: `Flow skóre se za druhou polovinu roku zlepšilo o ${Math.round(scoreChange)} bodů — tým nabývá momentum.`, type: 'positive' });
  } else if (scoreChange < -10) {
    insights.push({ text: `Flow skóre kleslo o ${Math.round(Math.abs(scoreChange))} bodů — systém se deterioruje. Prověřte energii a technický dluh.`, type: 'negative' });
  }

  // Team energy warning
  if (last.team_energy < 30) {
    insights.push({ text: `⚠️ Kritické: Energie týmu je ${last.team_energy}%. Hrozí vlna rezignací. Okamžitě snižte tlak na přesčasy.`, type: 'warning' });
  } else if (last.team_energy < 50) {
    insights.push({ text: `Energie týmu je nízká (${last.team_energy}%). Zvažte snížení přesčasů a zvýšení psychologické bezpečnosti.`, type: 'negative' });
  }

  // WIP limit effectiveness
  const avgWipRatio = metrics.slice(-12).reduce((a, m) => a + m.wip_vs_limit, 0) / 12;
  if (avgWipRatio > 1.3) {
    insights.push({ text: `WIP limit je systematicky překračován (průměr ${Math.round(avgWipRatio * 100)}% limitu). Zvyšte WIP limit nebo snižte inflow rate.`, type: 'warning' });
  } else if (avgWipRatio < 0.5 && params.wip_limit > 3) {
    insights.push({ text: `WIP využití je nízké (${Math.round(avgWipRatio * 100)}% limitu). Tým by mohl zpracovat více práce — zvažte snížení WIP limitu.`, type: 'neutral' });
  }

  // Technical debt spiral warning
  if (last.technical_debt > 70) {
    insights.push({ text: `Technický dluh (${last.technical_debt}%) výrazně zpomaluje delivery. Investice do refaktoringu se nyní vrátí rychleji než nové featury.`, type: 'warning' });
  } else if (last.technical_debt < 20 && params.refactoring_investment > 0) {
    insights.push({ text: `Technický dluh je zdravý (${last.technical_debt}%). Investice do kvódy se vyplácí.`, type: 'positive' });
  }

  // Backlog growth
  const backlogGrowth = last.backlog_size - metrics[0].backlog_size;
  if (backlogGrowth > 50) {
    insights.push({ text: `Backlog narostl o ${Math.round(backlogGrowth)} items — inflow převyšuje throughput. Zvažte snížení inflow nebo zvýšení kapacity.`, type: 'negative' });
  }

  // Defect rate
  if (last.defect_rate > 30) {
    insights.push({ text: `Míra defektů je ${last.defect_rate}%. Investice do testů a code review by dramaticky snížila rework a zvýšila throughput.`, type: 'negative' });
  }

  // WIP limit optimization
  if (params.wip_limit > params.team_size * 2) {
    insights.push({ text: `WIP limit ${params.wip_limit} je příliš vysoký pro tým ${params.team_size} lidí. Zkuste ${params.team_size + 2} — Little's Law to ocení.`, type: 'neutral' });
  }

  // Flow stability
  if (last.flow_stability < 40) {
    insights.push({ text: `Flow stabilita je nízká (${last.flow_stability}%). Vysoká variabilita throughputu ztěžuje plánování. Omezte scope changes a interrupt-driven práci.`, type: 'negative' });
  }

  // Knowledge growth
  const knowledgeGrowth = last.knowledge_level - metrics[0].knowledge_level;
  if (knowledgeGrowth > 20) {
    insights.push({ text: `Znalostní kapitál týmu narostl o ${Math.round(knowledgeGrowth)} bodů. Retrospektivy a psychologická bezpečnost se vyplácejí.`, type: 'positive' });
  }

  // Positive flow score
  if (last.flow_score > 75) {
    insights.push({ text: `Flow skóre ${last.flow_score}/100 — výborný výsledek! Tento tým je příkladem zdravého agilního flow.`, type: 'positive' });
  }

  return insights.slice(0, 4);
}
