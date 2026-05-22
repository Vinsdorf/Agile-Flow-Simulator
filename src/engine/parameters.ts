import { ParameterGroup, SimulationParameters } from './types';

export const SYSTEM_PARAMETER_GROUPS: ParameterGroup[] = [
  {
    id: 'mental_models',
    label: 'Mentální modely',
    icon: '🧠',
    parameters: [
      {
        key: 'shared_mental_model_alignment',
        label: 'Sdílený mentální model',
        description: 'Nakolik tým sdílí společné porozumění cíli produktu, zákazníkovi a tomu, jak systém funguje. Ovlivňuje: requirements_clarity (+), cross_functionality (+), scope_change_frequency (-), planning efektivitu (+).',
        min: 0, max: 100, default: 40, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'theory_in_use_gap',
        label: 'Propast teorie vs. praxe',
        description: 'Rozdíl mezi tím, co tým říká že dělá, a co skutečně dělá (Argyris). Vysoká hodnota = velká propast = ŠPATNÉ. Degraduje skutečnou účinnost VŠECH procesních parametrů (DoD, code review, retro, plánování).',
        min: 0, max: 100, default: 40, step: 5, format: 'percent', isNegative: true, isSystem: true,
      },
      {
        key: 'failure_perception',
        label: 'Vnímání selhání',
        description: '0% = blame culture (selhání = hrozba). 100% = learning culture (selhání = data). Ovlivňuje: psychological_safety (+), learning_rate (+), viditelnost tech dluhu (+).',
        min: 0, max: 100, default: 35, step: 5, format: 'percent', isSystem: true,
      },
    ],
  },
  {
    id: 'paradigm_goals',
    label: 'Paradigma & cíle',
    icon: '🔄',
    parameters: [
      {
        key: 'output_vs_outcome_orientation',
        label: 'Output vs. Outcome orientace',
        description: '0% = měříme počet stories. 100% = měříme dopad na uživatele. Outcome tým říká "ne" zbytečné práci → snižuje efektivní inflow, zvyšuje requirements_clarity.',
        min: 0, max: 100, default: 30, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'push_vs_pull_paradigm',
        label: 'Push vs. Pull systém',
        description: '0% = práce se přiděluje shora (push). 100% = tým si sám tahá práci (pull/kanban). Ovlivňuje efektivitu WIP limitu zásadně — v push systému je WIP limit jen číslo.',
        min: 0, max: 100, default: 30, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'predictive_vs_adaptive_planning',
        label: 'Prediktivní vs. adaptivní',
        description: '0% = detailní kvartální plán. 100% = plánujeme na horizont 1 sprintu. Ovlivňuje efektivitu planning_investment a reakci na scope_change.',
        min: 0, max: 100, default: 35, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'self_organization_level',
        label: 'Úroveň sebeorganizace',
        description: '0% = centrální řízení. 100% = tým autonomně rozhoduje. Zkracuje reakční dobu, ale vyžaduje shared_mental_model_alignment — bez něj vede k chaosu.',
        min: 0, max: 100, default: 35, step: 5, format: 'percent', isSystem: true,
      },
    ],
  },
  {
    id: 'sensemaking',
    label: 'Sensemaking',
    icon: '🔍',
    parameters: [
      {
        key: 'complexity_awareness',
        label: 'Cynefin povědomí',
        description: 'Schopnost rozlišit jasnou, komplikovanou a komplexní doménu. Nízká = tým analyzuje neanalyzovatelné. Ovlivňuje efektivitu planning_investment a defect_rate u komplexních stories.',
        min: 0, max: 100, default: 30, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'feedback_loop_quality',
        label: 'Kvalita feedback smyček',
        description: 'Rychlost a přesnost informací o výsledcích. ZESILOVAČ všech feedback smyček — retro, review, testing fungují jen tak dobře, jak kvalitní je informace pod nimi.',
        min: 0, max: 100, default: 40, step: 5, format: 'percent', isSystem: true,
      },
      {
        key: 'double_loop_learning',
        label: 'Dvojsmyčkové učení',
        description: 'Single-loop = děláme věci líp. Double-loop = zpochybňujeme předpoklady. Každé 4 sprinty automaticky zlepšuje nejslabší procesní parametr týmu.',
        min: 0, max: 100, default: 20, step: 5, format: 'percent', isSystem: true,
      },
    ],
  },
];

export const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    id: 'team',
    label: 'Struktura týmu',
    icon: '🏗️',
    parameters: [
      {
        key: 'team_size',
        label: 'Velikost týmu',
        description: 'Počet členů týmu. Více lidí = větší kapacita, ale i více komunikační overhead (nelineárně, Brooks\'s Law). Optimum je obvykle 5–8 lidí.',
        min: 3, max: 12, default: 6, step: 1, format: 'number',
      },
      {
        key: 'cross_functionality',
        label: 'Meziobor. zastupitelnost',
        description: 'Jak moc jsou členové týmu zastupitelní napříč disciplínami. Nízká hodnota = bottlenecky na specialistech a čekání.',
        min: 0, max: 100, default: 50, step: 5, format: 'percent',
      },
      {
        key: 'seniority_ratio',
        label: 'Podíl seniorů',
        description: 'Podíl seniorních členů. Ovlivňuje kvalitu, rychlost code review a mentoring juniorů.',
        min: 0, max: 100, default: 40, step: 5, format: 'percent',
      },
      {
        key: 'dedicated_team',
        label: 'Dedikovanost týmu',
        description: 'Jak moc je tým dedikovaný jednomu produktu vs. sdílený napříč projekty. Nízká = kontextové přepínání a ztráta flow.',
        min: 0, max: 100, default: 80, step: 5, format: 'percent',
      },
    ],
  },
  {
    id: 'process',
    label: 'Procesní nastavení',
    icon: '⚙️',
    parameters: [
      {
        key: 'wip_limit',
        label: 'WIP limit',
        description: 'Limit rozpracované práce. Klíčová páka — nižší = kratší cycle time dle Little\'s Law, ale možný idle při přílišném omezení.',
        min: 1, max: 20, default: 8, step: 1, format: 'number',
      },
      {
        key: 'sprint_length_days',
        label: 'Délka sprintu (dny)',
        description: 'Délka iterace. Kratší sprinty = rychlejší feedback a přizpůsobení, ale více overhead z ceremonií.',
        min: 5, max: 28, default: 14, step: 1, format: 'days',
      },
      {
        key: 'planning_investment',
        label: 'Investice do plánování',
        description: 'Kolik % času tým investuje do plánování a refinementu. Málo = nejasné požadavky a rework. Moc = overhead bez přidané hodnoty.',
        min: 0, max: 30, default: 10, step: 1, format: 'percent',
      },
      {
        key: 'retro_action_rate',
        label: 'Implementace retro akcí',
        description: 'Kolik % akcí z retrospektiv se skutečně realizuje. Přímo ovlivňuje rychlost učení a zlepšování procesů.',
        min: 0, max: 100, default: 40, step: 5, format: 'percent',
      },
      {
        key: 'definition_of_done_strictness',
        label: 'Přísnost Definition of Done',
        description: 'Přísnost DoD. Vyšší = méně defektů unikajících do produkce, ale pomalejší completion rate.',
        min: 0, max: 100, default: 60, step: 5, format: 'percent',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technické praktiky',
    icon: '🔧',
    parameters: [
      {
        key: 'test_automation',
        label: 'Pokrytí testy',
        description: 'Pokrytí automatickými testy. Vyšší = méně regresí, rychlejší feedback, ale vyžaduje počáteční investici.',
        min: 0, max: 100, default: 30, step: 5, format: 'percent',
      },
      {
        key: 'ci_cd_maturity',
        label: 'Vyspělost CI/CD',
        description: 'Zralost CI/CD pipeline. Vyšší = rychlejší a bezpečnější deploymenty, méně manuální práce.',
        min: 0, max: 100, default: 40, step: 5, format: 'percent',
      },
      {
        key: 'code_review_thoroughness',
        label: 'Důkladnost code review',
        description: 'Jak důkladně se reviewují změny. Vyšší = méně defektů, ale může zpomalit flow při bottlenecku reviewerů.',
        min: 0, max: 100, default: 50, step: 5, format: 'percent',
      },
      {
        key: 'refactoring_investment',
        label: 'Investice do refaktoringu',
        description: 'Kolik % kapacity jde na splácení technického dluhu. Přímá páka na snižování dluhu a zlepšení dlouhodobé velocity.',
        min: 0, max: 20, default: 5, step: 1, format: 'percent',
      },
      {
        key: 'tooling_investment',
        label: 'Investice do nástrojů',
        description: 'Investice do nástrojů, automatizace a developer experience. Zrychluje práci a snižuje friction dlouhodobě.',
        min: 0, max: 15, default: 5, step: 1, format: 'percent',
      },
    ],
  },
  {
    id: 'work',
    label: 'Práce a požadavky',
    icon: '📋',
    parameters: [
      {
        key: 'inflow_rate_stories_per_sprint',
        label: 'Příchod stories/sprint',
        description: 'Kolik nových stories přichází do backlogu za sprint. Pokud převyšuje throughput, backlog nekontrolovaně roste.',
        min: 1, max: 30, default: 12, step: 1, format: 'number',
      },
      {
        key: 'avg_story_complexity',
        label: 'Průměrná složitost story',
        description: 'Průměrná složitost story v story pointech (Fibonacci). Vyšší = delší cycle time a nižší throughput v počtu stories.',
        min: 1, max: 13, default: 5, step: 1, format: 'number',
      },
      {
        key: 'requirements_clarity',
        label: 'Jasnost požadavků',
        description: 'Kvalita a jasnost specifikací. Nízká = více reworku, přepracování a frustrace. Závisí na stakeholder engagementu.',
        min: 0, max: 100, default: 50, step: 5, format: 'percent',
      },
      {
        key: 'scope_change_frequency',
        label: 'Frekvence změn scope',
        description: 'Jak často se mění scope rozpracovaných items. Vysoká = ztrátový rework, frustrace týmu a delší cycle time.',
        min: 0, max: 50, default: 15, step: 5, format: 'percent',
      },
      {
        key: 'interrupt_driven_work',
        label: 'Neplánovaná práce',
        description: 'Podíl neplánované práce (incidenty, hotfixy, ad-hoc požadavky). Přímo snižuje dostupnou kapacitu pro plánované featury.',
        min: 0, max: 50, default: 10, step: 5, format: 'percent',
      },
    ],
  },
  {
    id: 'human',
    label: 'Lidský faktor',
    icon: '🧠',
    parameters: [
      {
        key: 'psychological_safety',
        label: 'Psychologická bezpečnost',
        description: 'Míra, do jaké se lidé cítí bezpečně experimentovat, dělat chyby a říkat svůj názor. Zásadně ovlivňuje inovace a učení.',
        min: 0, max: 100, default: 60, step: 5, format: 'percent',
      },
      {
        key: 'focus_time_ratio',
        label: 'Čas soustředěné práce',
        description: 'Kolik % pracovní doby mohou vývojáři pracovat bez přerušení a kontextového přepínání. Kritické pro produktivitu.',
        min: 0, max: 100, default: 50, step: 5, format: 'percent',
      },
      {
        key: 'meeting_overhead',
        label: 'Overhead meetingů',
        description: 'Čas strávený na meetingách mimo sprint ceremonie. Přímo snižuje dostupnou kapacitu pro vývoj.',
        min: 0, max: 40, default: 15, step: 5, format: 'percent',
      },
      {
        key: 'stakeholder_engagement',
        label: 'Zapojení stakeholderů',
        description: 'Dostupnost a aktivita stakeholderů. Nízká = špatný feedback, nejasné priority, blokace při rozhodování.',
        min: 0, max: 100, default: 50, step: 5, format: 'percent',
      },
      {
        key: 'overtime_pressure',
        label: 'Tlak na přesčasy',
        description: 'Intenzita tlaku na přesčasy. Krátkodobě zvyšuje output, ale systematicky snižuje team energy, kvalitu a dlouhodobou velocity.',
        min: 0, max: 50, default: 5, step: 5, format: 'percent',
      },
    ],
  },
];

export const DEFAULT_PARAMETERS: SimulationParameters = {
  team_size: 6,
  cross_functionality: 50,
  seniority_ratio: 40,
  dedicated_team: 80,
  wip_limit: 8,
  sprint_length_days: 14,
  planning_investment: 10,
  retro_action_rate: 40,
  definition_of_done_strictness: 60,
  test_automation: 30,
  ci_cd_maturity: 40,
  code_review_thoroughness: 50,
  refactoring_investment: 5,
  tooling_investment: 5,
  inflow_rate_stories_per_sprint: 12,
  avg_story_complexity: 5,
  requirements_clarity: 50,
  scope_change_frequency: 15,
  interrupt_driven_work: 10,
  psychological_safety: 60,
  focus_time_ratio: 50,
  meeting_overhead: 15,
  stakeholder_engagement: 50,
  overtime_pressure: 5,
  shared_mental_model_alignment: 40,
  theory_in_use_gap: 40,
  failure_perception: 35,
  output_vs_outcome_orientation: 30,
  push_vs_pull_paradigm: 30,
  predictive_vs_adaptive_planning: 35,
  self_organization_level: 35,
  complexity_awareness: 30,
  feedback_loop_quality: 40,
  double_loop_learning: 20,
};
