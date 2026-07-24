export {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from '@a11y-agent-ops/shared';

import type { Locale } from '@a11y-agent-ops/shared';

export interface ReportStrings {
  htmlLang: string;
  dateLocale: string;
  reportDocumentTitle: string;
  accessibilityReport: string;
  accessibilityScore: string;
  target: string;
  generated: string;
  pagesScanned: string;
  totalIssues: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
  issues: string;
  findings: (count: number) => string;
  emptyTitle: string;
  emptyBody: string;
  noScreenshot: string;
  url: string;
  wcagRule: string;
  selector: string;
  none: string;
  description: string;
  aiExplanation: string;
  suggestedFix: string;
  openMarkdownTask: (id: string) => string;
  priorityLabel: (priority: string) => string;
}

export interface TaskStrings {
  priority: string;
  url: string;
  componentSelector: string;
  screenshot: string;
  problem: string;
  userImpact: string;
  recommendedFix: string;
  wcagReference: string;
  noScreenshot: string;
  none: string;
  ruleId: string;
  impact: string;
  description: string;
  help: string;
  unknown: string;
  fallbackRecommendedFix: string;
  impactCritical: string;
  impactModerate: string;
  impactLow: string;
  affectedHtml: string;
}

export interface AiStrings {
  /** Appended to the system prompt to control output language */
  languageInstruction: string;
  analyzeInstruction: string;
}

const EN_REPORT: ReportStrings = {
  htmlLang: 'en',
  dateLocale: 'en-GB',
  reportDocumentTitle: 'a11y-agent-ops report',
  accessibilityReport: 'Accessibility report',
  accessibilityScore: 'Accessibility score',
  target: 'Target',
  generated: 'Generated',
  pagesScanned: 'Pages scanned',
  totalIssues: 'Total issues',
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  issues: 'Issues',
  findings: (count) => `${String(count)} finding${count === 1 ? '' : 's'}`,
  emptyTitle: 'No accessibility issues found',
  emptyBody: 'Great job — axe-core reported zero violations for the scanned pages.',
  noScreenshot: 'No screenshot',
  url: 'URL',
  wcagRule: 'WCAG rule',
  selector: 'Selector',
  none: '(none)',
  description: 'Description',
  aiExplanation: 'AI explanation',
  suggestedFix: 'Suggested fix',
  openMarkdownTask: (id) => `Open Markdown task (${id}.md)`,
  priorityLabel: (priority) => priority,
};

const SK_REPORT: ReportStrings = {
  htmlLang: 'sk',
  dateLocale: 'sk-SK',
  reportDocumentTitle: 'a11y-agent-ops report',
  accessibilityReport: 'Report prístupnosti',
  accessibilityScore: 'Skóre prístupnosti',
  target: 'Cieľ',
  generated: 'Vygenerované',
  pagesScanned: 'Naskenované stránky',
  totalIssues: 'Celkový počet problémov',
  critical: 'Kritické',
  high: 'Vysoké',
  medium: 'Stredné',
  low: 'Nízke',
  issues: 'Problémy',
  findings: (count) => {
    if (count === 1) return '1 nález';
    if (count >= 2 && count <= 4) return `${String(count)} nálezy`;
    return `${String(count)} nálezov`;
  },
  emptyTitle: 'Nenašli sa žiadne problémy prístupnosti',
  emptyBody: 'Výborne — axe-core nahlásil nula porušení na naskenovaných stránkach.',
  noScreenshot: 'Bez screenshotu',
  url: 'URL',
  wcagRule: 'WCAG pravidlo',
  selector: 'Selektor',
  none: '(žiadny)',
  description: 'Popis',
  aiExplanation: 'AI vysvetlenie',
  suggestedFix: 'Navrhovaná oprava',
  openMarkdownTask: (id) => `Otvoriť Markdown úlohu (${id}.md)`,
  priorityLabel: (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'Kritické';
      case 'high':
        return 'Vysoké';
      case 'medium':
        return 'Stredné';
      case 'low':
        return 'Nízke';
      default:
        return priority;
    }
  },
};

const EN_TASKS: TaskStrings = {
  priority: 'Priority:',
  url: 'URL:',
  componentSelector: 'Component/Selector:',
  screenshot: 'Screenshot:',
  problem: 'Problem',
  userImpact: 'User impact',
  recommendedFix: 'Recommended fix',
  wcagReference: 'WCAG reference',
  noScreenshot: '_No screenshot available_',
  none: '(none)',
  ruleId: 'Rule ID',
  impact: 'Impact',
  description: 'Description',
  help: 'Help',
  unknown: 'unknown',
  fallbackRecommendedFix:
    'Review the affected element and apply the WCAG-aligned fix described in the rule help URL. Prefer visible text, labels, or ARIA names over silent icon-only controls when applicable.',
  impactCritical:
    'This issue likely blocks or severely impairs access for assistive technology users.',
  impactModerate:
    'This issue creates noticeable friction for assistive technology or keyboard users.',
  impactLow:
    'This issue reduces accessibility quality and should be fixed to meet WCAG expectations.',
  affectedHtml: 'Affected HTML:',
};

const SK_TASKS: TaskStrings = {
  priority: 'Priorita:',
  url: 'URL:',
  componentSelector: 'Komponent/Selektor:',
  screenshot: 'Screenshot:',
  problem: 'Problém',
  userImpact: 'Dopad na používateľa',
  recommendedFix: 'Odporúčaná oprava',
  wcagReference: 'WCAG referencia',
  noScreenshot: '_Screenshot nie je k dispozícii_',
  none: '(žiadny)',
  ruleId: 'ID pravidla',
  impact: 'Závažnosť',
  description: 'Popis',
  help: 'Pomoc',
  unknown: 'neznáma',
  fallbackRecommendedFix:
    'Skontrolujte postihnutý prvok a aplikujte opravu podľa WCAG z help URL pravidla. Preferujte viditeľný text, labely alebo ARIA názvy pred tichými ovládacími prvkami iba s ikonou.',
  impactCritical:
    'Tento problém pravdepodobne blokuje alebo výrazne sťažuje prístup používateľom asistenčných technológií.',
  impactModerate:
    'Tento problém spôsobuje výrazné trenie pre používateľov asistenčných technológií alebo klávesnice.',
  impactLow:
    'Tento problém znižuje kvalitu prístupnosti a mal by sa opraviť podľa očakávaní WCAG.',
  affectedHtml: 'Postihnuté HTML:',
};

const EN_AI: AiStrings = {
  languageInstruction: 'Write all JSON string values in clear English.',
  analyzeInstruction: 'Analyze this accessibility violation and return JSON only.',
};

const SK_AI: AiStrings = {
  languageInstruction:
    'Write ALL JSON string values in Slovak (slovenčina). Keep technical identifiers (CSS selectors, HTML attributes, rule IDs, URLs) unchanged. Priority must still be one of: critical | high | medium | low.',
  analyzeInstruction:
    'Analyzuj toto porušenie prístupnosti a vráť iba JSON. Všetky textové hodnoty musia byť po slovensky.',
};

export function getReportStrings(locale: Locale): ReportStrings {
  return locale === 'sk' ? SK_REPORT : EN_REPORT;
}

export function getTaskStrings(locale: Locale): TaskStrings {
  return locale === 'sk' ? SK_TASKS : EN_TASKS;
}

export function getAiStrings(locale: Locale): AiStrings {
  return locale === 'sk' ? SK_AI : EN_AI;
}
