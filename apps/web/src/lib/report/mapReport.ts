import type {
  AccessibilityReport,
  AnalyzedViolation,
  TaskIssue,
  TaskPriority,
} from '@a11y-agent-ops/shared'

/** Audience-facing severity labels (axe impact → report vocabulary). */
export type ReportSeverity = 'Critical' | 'Serious' | 'Moderate' | 'Minor'

export type ReportAudience = 'developer' | 'qa' | 'product' | 'client'

export interface ReportSeverityCount {
  key: ReportSeverity
  label: ReportSeverity
  count: number
}

export interface EnrichedIssue {
  id: string
  title: string
  severity: ReportSeverity
  pageUrl: string
  selector: string
  htmlSnippet: string
  wcagReference: string
  helpUrl: string
  ruleId: string
  problem: string
  userImpact: string
  recommendedFix: string
  suggestedCodeFix: string
  aiExplanation: string | null
  estimatedEffort: string
  /** Highlighted element crop (data URL or absolute/relative path) */
  screenshotCropSrc: string | null
  /** True when AI analysis ran for this issue */
  hasAi: boolean
  /** QA */
  reproduction: string[]
  expectedBehavior: string
  verificationChecklist: string[]
  /** Client-friendly */
  plainTitle: string
  plainWhyItMatters: string
  plainImprovement: string
  plainBenefit: string
}

export interface ReportPresentation {
  targetUrl: string
  projectSlug: string
  score: number
  wcagLevel: string
  totalIssues: number
  pagesScanned: number
  estimatedFixTime: string
  progressPercent: number
  severities: ReportSeverityCount[]
  issues: EnrichedIssue[]
  aiRan: boolean
  healthLabel: string
  healthSummary: string
  businessImpact: string
  recommendedPriorities: string[]
  clientIntro: string
  clientBenefits: string[]
}

const SEVERITY_ORDER: ReportSeverity[] = ['Critical', 'Serious', 'Moderate', 'Minor']

export function priorityToSeverity(priority: TaskPriority): ReportSeverity {
  switch (priority) {
    case 'Critical':
      return 'Critical'
    case 'High':
      return 'Serious'
    case 'Medium':
      return 'Moderate'
    case 'Low':
      return 'Minor'
  }
}

function parseEffortMinutes(effort: string): number {
  const match = effort.match(/(\d+)\s*[–-]\s*(\d+)/)
  if (!match) {
    return 30
  }
  const low = Number(match[1])
  const high = Number(match[2])
  return Math.round((low + high) / 2)
}

function formatTotalEffort(issues: EnrichedIssue[]): string {
  const totalMinutes = issues.reduce(
    (sum, issue) => sum + parseEffortMinutes(issue.estimatedEffort),
    0,
  )
  if (totalMinutes < 60) {
    return `~${String(totalMinutes)} min`
  }
  const hours = totalMinutes / 60
  const rounded = Math.round(hours * 10) / 10
  return `~${String(rounded)} h`
}

function healthFromScore(score: number): { label: string; summary: string } {
  if (score >= 90) {
    return {
      label: 'Strong',
      summary: 'Accessibility foundations are solid. Remaining work is mostly polish.',
    }
  }
  if (score >= 75) {
    return {
      label: 'Good',
      summary: 'The experience works for many people, with clear gaps to close before launch.',
    }
  }
  if (score >= 60) {
    return {
      label: 'Needs attention',
      summary: 'Important barriers exist. Prioritize critical and serious issues this sprint.',
    }
  }
  return {
    label: 'At risk',
    summary: 'Users with disabilities may be blocked from key tasks. Treat as launch risk.',
  }
}

/**
 * Map engine `AccessibilityReport` → UI presentation model.
 * Swap mock → real data without changing report components.
 */
export function toReportPresentation(
  report: AccessibilityReport,
  options?: { wcagLevel?: string },
): ReportPresentation {
  const analyzedById = new Map(
    (report.analyzed ?? [])
      .filter((item): item is AnalyzedViolation & { violationId: string } =>
        Boolean(item.violationId),
      )
      .map((item) => [item.violationId, item] as const),
  )

  const issues: EnrichedIssue[] = (report.issues ?? []).map((issue) =>
    enrichIssue(issue, analyzedById.get(issue.violationId)),
  )

  const dashboard = report.dashboard
  const score = dashboard?.accessibilityScore ?? 0
  const health = healthFromScore(score)

  const severities: ReportSeverityCount[] = SEVERITY_ORDER.map((key) => ({
    key,
    label: key,
    count: issues.filter((issue) => issue.severity === key).length,
  }))

  const progressPercent = Math.max(0, Math.min(100, score))

  return {
    targetUrl: report.targetUrl,
    projectSlug: report.projectSlug,
    score,
    wcagLevel: options?.wcagLevel ?? 'WCAG 2.2 AA',
    totalIssues: dashboard?.totalIssues ?? issues.length,
    pagesScanned: dashboard?.pagesScanned ?? report.pagesFound,
    estimatedFixTime: formatTotalEffort(issues),
    progressPercent,
    severities,
    issues,
    aiRan: report.aiRan,
    healthLabel: health.label,
    healthSummary: health.summary,
    businessImpact:
      'Unresolved barriers increase support load, legal exposure, and drop-off in checkout and navigation — especially for keyboard and screen-reader users.',
    recommendedPriorities: [
      'Fix all Critical issues before the next release.',
      'Schedule Serious contrast and naming issues in the current sprint.',
      'Batch Moderate content fixes (alt text) with design QA.',
      'Track Minor skip-link polish in the accessibility backlog.',
    ],
    clientIntro:
      'We reviewed how easy your website is to use for people with disabilities — including those who use keyboards, screen readers, or need clearer text.',
    clientBenefits: [
      'More customers can complete key journeys without help.',
      'Clearer pages reduce frustration and support tickets.',
      'Stronger accessibility reduces compliance and brand risk.',
      'Inclusive design improves usability for everyone.',
    ],
  }
}

function enrichIssue(
  issue: TaskIssue,
  analyzed: AnalyzedViolation | undefined,
): EnrichedIssue {
  const severity = priorityToSeverity(issue.priority)
  const htmlSnippet = analyzed?.input.html ?? defaultHtmlSnippet(issue)
  const suggestedCodeFix = analyzed?.analysis.suggestedFix ?? issue.recommendedFix
  const hasAi = Boolean(analyzed)
  const aiExplanation = analyzed?.analysis.developerExplanation ?? null
  const estimatedEffort =
    analyzed?.analysis.estimatedEffort ?? defaultEffort(issue.priority)

  return {
    id: issue.violationId,
    title: issue.title,
    severity,
    pageUrl: issue.url,
    selector: issue.selector,
    htmlSnippet,
    wcagReference: issue.wcagReference,
    helpUrl: issue.helpUrl ?? '',
    ruleId: issue.ruleId ?? 'unknown',
    problem: issue.problem,
    userImpact: issue.userImpact,
    recommendedFix: issue.recommendedFix,
    suggestedCodeFix,
    aiExplanation,
    estimatedEffort,
    screenshotCropSrc: issue.screenshotPath,
    hasAi,
    reproduction: buildReproduction(issue),
    expectedBehavior: buildExpected(issue),
    verificationChecklist: buildChecklist(issue),
    plainTitle: plainTitle(issue),
    plainWhyItMatters: issue.userImpact,
    plainImprovement: plainImprovement(issue),
    plainBenefit: plainBenefit(severity),
  }
}

function defaultEffort(priority: TaskPriority): string {
  switch (priority) {
    case 'Critical':
      return '30–60 minutes'
    case 'High':
      return '15–45 minutes'
    case 'Medium':
      return '10–30 minutes'
    case 'Low':
      return '5–15 minutes'
  }
}

function defaultHtmlSnippet(issue: TaskIssue): string {
  if (issue.ruleId === 'label') {
    return `<input id="email" name="email" type="email" placeholder="Email" />`
  }
  if (issue.ruleId === 'color-contrast') {
    return `<p class="hero-caption">Ship faster with clearer insights.</p>`
  }
  if (issue.ruleId === 'button-name') {
    return `<button class="menu-toggle" type="button">\n  <svg aria-hidden="true">…</svg>\n</button>`
  }
  if (issue.ruleId === 'image-alt') {
    return `<img class="card-thumb" src="/images/article.jpg" />`
  }
  return `<a class="skip-link" href="#main" tabindex="-1">Skip to content</a>`
}

function buildReproduction(issue: TaskIssue): string[] {
  return [
    `Open ${issue.url}`,
    `Locate the element matching ${issue.selector}`,
    'Reproduce with keyboard-only navigation and a screen reader (VoiceOver / NVDA)',
    `Confirm the failure: ${issue.problem}`,
  ]
}

function buildExpected(issue: TaskIssue): string {
  return `The control is perceivable and operable: ${issue.recommendedFix}`
}

function buildChecklist(issue: TaskIssue): string[] {
  return [
    'Issue no longer appears in a fresh accessibility scan',
    'Keyboard focus order remains logical',
    'Screen reader announces a clear accessible name / purpose',
    `Visual design still matches intent on ${issue.url}`,
  ]
}

function plainTitle(issue: TaskIssue): string {
  switch (issue.ruleId) {
    case 'label':
      return 'A form field is hard to understand'
    case 'color-contrast':
      return 'Some text is too hard to read'
    case 'button-name':
      return 'A button does not say what it does'
    case 'image-alt':
      return 'Some images have no description'
    default:
      return 'Part of the page is harder to use than it should be'
  }
}

function plainImprovement(issue: TaskIssue): string {
  switch (issue.ruleId) {
    case 'label':
      return 'Add a clear label next to the email field so everyone knows what to type.'
    case 'color-contrast':
      return 'Make the text darker so it stands out clearly against the background.'
    case 'button-name':
      return 'Give the menu button a short name like “Open menu”.'
    case 'image-alt':
      return 'Add short descriptions for meaningful images.'
    default:
      return 'Make it easy to jump past repeated navigation with the keyboard.'
  }
}

function plainBenefit(severity: ReportSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'Removes a blocker that can stop people from completing a key task.'
    case 'Serious':
      return 'Makes everyday browsing clearer and less exhausting.'
    case 'Moderate':
      return 'Helps more visitors understand content without asking for help.'
    case 'Minor':
      return 'Improves comfort for keyboard users and power users alike.'
  }
}
