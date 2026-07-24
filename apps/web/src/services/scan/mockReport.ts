import type {
  AccessibilityReport,
  AnalyzedViolation,
  TaskIssue,
} from '@a11y-agent-ops/shared'

function buildIssues(targetUrl: string): TaskIssue[] {
  const origin = safeOrigin(targetUrl)

  return [
    {
      violationId: 'A11Y-001',
      title: 'Form fields missing accessible labels',
      priority: 'Critical',
      url: `${origin}/checkout`,
      selector: 'input#email',
      screenshotPath: null,
      problem:
        'The email field has no associated <label> or accessible name, so screen reader users cannot identify its purpose.',
      userImpact:
        'Blind and low-vision users may submit incomplete forms or abandon checkout.',
      recommendedFix:
        'Associate a visible <label for="email"> or provide aria-label / aria-labelledby.',
      wcagReference: 'WCAG 1.3.1 Info and Relationships · label',
      ruleId: 'label',
      description: 'Form elements must have labels',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
    },
    {
      violationId: 'A11Y-002',
      title: 'Insufficient text contrast',
      priority: 'High',
      url: `${origin}/`,
      selector: '.hero-caption',
      screenshotPath: null,
      problem:
        'Body text on the hero uses a light gray on white with a contrast ratio below WCAG AA.',
      userImpact:
        'Users with low vision or in bright environments struggle to read the hero copy.',
      recommendedFix:
        'Increase foreground contrast to at least 4.5:1 for normal text (e.g. #3f4654 on #ffffff).',
      wcagReference: 'WCAG 1.4.3 Contrast (Minimum) · color-contrast',
      ruleId: 'color-contrast',
      description: 'Elements must meet minimum color contrast ratio thresholds',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
    },
    {
      violationId: 'A11Y-003',
      title: 'Icon button has no accessible name',
      priority: 'High',
      url: `${origin}/`,
      selector: 'button.menu-toggle',
      screenshotPath: null,
      problem:
        'The navigation toggle only contains an SVG icon and has no accessible name.',
      userImpact: 'Screen reader users hear “button” with no context for what it does.',
      recommendedFix:
        'Add aria-label="Open menu" (and update when open) or visually hidden text.',
      wcagReference: 'WCAG 4.1.2 Name, Role, Value · button-name',
      ruleId: 'button-name',
      description: 'Buttons must have discernible text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name',
    },
    {
      violationId: 'A11Y-004',
      title: 'Images missing alternative text',
      priority: 'Medium',
      url: `${origin}/blog`,
      selector: 'img.card-thumb',
      screenshotPath: null,
      problem: 'Product and article thumbnails omit the alt attribute.',
      userImpact: 'Image content is invisible to assistive technology and when images fail to load.',
      recommendedFix:
        'Provide descriptive alt text, or alt="" when the image is purely decorative.',
      wcagReference: 'WCAG 1.1.1 Non-text Content · image-alt',
      ruleId: 'image-alt',
      description: 'Images must have alternate text',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
    },
    {
      violationId: 'A11Y-005',
      title: 'Skip link is not focusable',
      priority: 'Low',
      url: `${origin}/`,
      selector: 'a.skip-link',
      screenshotPath: null,
      problem: 'The skip-to-content link is present in the DOM but removed from the tab order.',
      userImpact: 'Keyboard users cannot skip repetitive navigation.',
      recommendedFix:
        'Ensure the skip link is the first focusable element and becomes visible on focus.',
      wcagReference: 'WCAG 2.4.1 Bypass Blocks · skip-link',
      ruleId: 'skip-link',
      description: 'Page should provide a way to skip repeated blocks',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/bypass',
    },
  ]
}

function buildAnalyzed(issues: TaskIssue[]): AnalyzedViolation[] {
  return issues.map((issue) => ({
    violationId: issue.violationId,
    input: {
      rule: issue.ruleId ?? 'unknown',
      description: issue.description ?? issue.problem,
      html: htmlForIssue(issue),
      selector: issue.selector,
      screenshotPath: null,
      url: issue.url,
    },
    analysis: {
      title: issue.title,
      summary: issue.problem,
      developerExplanation: explanationFor(issue),
      suggestedFix: codeFixFor(issue),
      uxImpact: issue.userImpact,
      priority: priorityToAi(issue.priority),
      estimatedEffort: effortFor(issue.priority),
    },
  }))
}

function htmlForIssue(issue: TaskIssue): string {
  switch (issue.ruleId) {
    case 'label':
      return `<input id="email" name="email" type="email" placeholder="Email" />`
    case 'color-contrast':
      return `<p class="hero-caption" style="color:#b0b6c2">Ship faster with clearer insights.</p>`
    case 'button-name':
      return `<button class="menu-toggle" type="button">\n  <svg width="20" height="20" aria-hidden="true">…</svg>\n</button>`
    case 'image-alt':
      return `<img class="card-thumb" src="/images/article.jpg" width="320" height="180" />`
    default:
      return `<a class="skip-link" href="#main" tabindex="-1">Skip to content</a>`
  }
}

function codeFixFor(issue: TaskIssue): string {
  switch (issue.ruleId) {
    case 'label':
      return `<label for="email">Email address</label>\n<input id="email" name="email" type="email" autocomplete="email" />`
    case 'color-contrast':
      return `<p class="hero-caption" style="color:#3f4654">Ship faster with clearer insights.</p>`
    case 'button-name':
      return `<button class="menu-toggle" type="button" aria-label="Open menu">\n  <svg width="20" height="20" aria-hidden="true">…</svg>\n</button>`
    case 'image-alt':
      return `<img\n  class="card-thumb"\n  src="/images/article.jpg"\n  width="320"\n  height="180"\n  alt="Designer reviewing an accessibility checklist"\n/>`
    default:
      return `<a class="skip-link" href="#main">Skip to content</a>`
  }
}

function explanationFor(issue: TaskIssue): string {
  switch (issue.ruleId) {
    case 'label':
      return 'Screen readers rely on an accessible name. A placeholder is not a label — associate a <label> (or aria-labelledby) so the field purpose is announced.'
    case 'color-contrast':
      return 'WCAG AA requires at least 4.5:1 contrast for normal text. The current gray-on-white pair fails for many low-vision users.'
    case 'button-name':
      return 'Icon-only controls need an accessible name. Without it, AT announces a generic “button”, blocking confident navigation.'
    case 'image-alt':
      return 'Informative images need concise alt text. Decorative images should use empty alt so assistive tech can skip them.'
    default:
      return 'A working skip link lets keyboard users bypass repeated chrome and reach primary content quickly.'
  }
}

function priorityToAi(
  priority: TaskIssue['priority'],
): 'critical' | 'high' | 'medium' | 'low' {
  switch (priority) {
    case 'Critical':
      return 'critical'
    case 'High':
      return 'high'
    case 'Medium':
      return 'medium'
    case 'Low':
      return 'low'
  }
}

function effortFor(priority: TaskIssue['priority']): string {
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

function safeOrigin(raw: string): string {
  try {
    return new URL(raw).origin
  } catch {
    return 'https://example.com'
  }
}

function projectSlugFromUrl(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, '') || 'project'
  } catch {
    return 'project'
  }
}

/**
 * Realistic AccessibilityReport shaped like the engine output.
 */
export function createMockAccessibilityReport(
  targetUrl: string,
  options?: { enableAi?: boolean },
): AccessibilityReport {
  const enableAi = options?.enableAi === true
  const issues = buildIssues(targetUrl)
  const analyzed = enableAi ? buildAnalyzed(issues) : []
  const projectSlug = projectSlugFromUrl(targetUrl)

  const criticalIssues = issues.filter((i) => i.priority === 'Critical').length
  const highIssues = issues.filter((i) => i.priority === 'High').length
  const mediumIssues = issues.filter((i) => i.priority === 'Medium').length
  const lowIssues = issues.filter((i) => i.priority === 'Low').length
  const deductions = criticalIssues * 12 + highIssues * 6 + mediumIssues * 3 + lowIssues * 1
  const accessibilityScore = Math.max(0, Math.min(100, 100 - deductions))

  return {
    targetUrl,
    pagesFound: 8,
    issuesFound: issues.length,
    reportPath: `.a11y-ops-report/${projectSlug}/index.html`,
    tasksDir: `.a11y-ops-report/${projectSlug}/tasks`,
    projectSlug,
    aiRan: enableAi,
    configPath: null,
    dashboard: {
      accessibilityScore,
      pagesScanned: 8,
      totalIssues: issues.length,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
    },
    issues,
    analyzed,
  }
}
