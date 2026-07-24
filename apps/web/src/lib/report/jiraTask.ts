import type { EnrichedIssue } from '@/lib/report'

/**
 * Jira / Linear / GitHub-ready Markdown — mirrors CLI task files.
 */
export function formatJiraTaskMarkdown(issue: EnrichedIssue): string {
  const screenshotLine = issue.screenshotCropSrc
    ? `Highlighted crop attached in report (${issue.id}.png)`
    : '_No screenshot available_'

  return [
    `# ${issue.title}`,
    '',
    '**Priority**',
    mapSeverityToPriority(issue.severity),
    '',
    '**URL**',
    issue.pageUrl,
    '',
    '**Component / Selector**',
    `\`${issue.selector || 'n/a'}\``,
    '',
    '**Screenshot**',
    screenshotLine,
    '',
    '## Problem',
    '',
    issue.problem,
    '',
    '## User impact',
    '',
    issue.userImpact,
    '',
    '## Recommended fix',
    '',
    issue.recommendedFix,
    '',
    '## WCAG reference',
    '',
    issue.wcagReference,
    '',
  ].join('\n')
}

function mapSeverityToPriority(severity: EnrichedIssue['severity']): string {
  switch (severity) {
    case 'Critical':
      return 'Critical'
    case 'Serious':
      return 'High'
    case 'Moderate':
      return 'Medium'
    case 'Minor':
      return 'Low'
  }
}
