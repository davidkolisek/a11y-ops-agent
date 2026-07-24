import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AnalyzedViolation } from '../ai/types.js';
import {
  DEFAULT_LOCALE,
  getTaskStrings,
  type Locale,
  type TaskStrings,
} from '../i18n/index.js';
import type { AccessibilityViolation, PageScanResult } from '../scanner/types.js';
import { formatViolationScreenshotId } from '../screenshots/index.js';
import type { ViolationScreenshotResult } from '../screenshots/types.js';
import {
  DEFAULT_TASKS_DIR,
  ReportError,
  type GenerateTasksOptions,
  type GenerateTasksResult,
  type TaskIssue,
  type TaskPriority,
} from './types.js';

/**
 * Build a single Jira-ready Markdown task body.
 */
export function renderTaskMarkdown(
  issue: TaskIssue,
  tasksDir: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const t = getTaskStrings(locale);
  const screenshotLine = formatScreenshotLine(issue.screenshotPath, tasksDir, t);

  return [
    `# ${issue.title}`,
    '',
    t.priority,
    issue.priority,
    '',
    t.url,
    issue.url,
    '',
    t.componentSelector,
    `\`${issue.selector || t.none}\``,
    '',
    t.screenshot,
    screenshotLine,
    '',
    `## ${t.problem}`,
    '',
    issue.problem,
    '',
    `## ${t.userImpact}`,
    '',
    issue.userImpact,
    '',
    `## ${t.recommendedFix}`,
    '',
    issue.recommendedFix,
    '',
    `## ${t.wcagReference}`,
    '',
    issue.wcagReference,
    '',
  ].join('\n');
}

/**
 * Write one Markdown task file: `.a11y-ops-report/tasks/A11Y-001.md`
 * @returns Absolute path to the written file
 */
export async function generateTaskFile(
  issue: TaskIssue,
  outputDir: string = DEFAULT_TASKS_DIR,
  locale: Locale = DEFAULT_LOCALE,
): Promise<string> {
  const absoluteDir = path.resolve(outputDir);
  await mkdir(absoluteDir, { recursive: true });

  const filePath = path.join(absoluteDir, `${issue.violationId}.md`);
  const markdown = renderTaskMarkdown(issue, absoluteDir, locale);
  await writeFile(filePath, markdown, 'utf8');
  return filePath;
}

/**
 * Generate Markdown tasks for every accessibility issue.
 */
export async function generateTasks(
  issues: TaskIssue[],
  options: GenerateTasksOptions = {},
): Promise<GenerateTasksResult> {
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_TASKS_DIR);
  const locale = options.locale ?? DEFAULT_LOCALE;

  if (issues.length === 0) {
    await mkdir(outputDir, { recursive: true });
    return { outputDir, files: [] };
  }

  const files: string[] = [];

  for (let index = 0; index < issues.length; index += 1) {
    const issue = issues[index];
    if (!issue) {
      continue;
    }

    try {
      const filePath = await generateTaskFile(issue, outputDir, locale);
      files.push(filePath);
      options.onTaskWritten?.(filePath, issue, index + 1, issues.length);
    } catch (cause) {
      throw new ReportError(
        `Failed to write task for ${issue.violationId}`,
        'TASK_WRITE_FAILED',
        cause,
      );
    }
  }

  return { outputDir, files };
}

/**
 * Map scan results (+ optional screenshots / AI analysis) into task issues.
 */
export function buildTaskIssues(
  scanResults: PageScanResult[],
  screenshots: ViolationScreenshotResult[] = [],
  analyzed: AnalyzedViolation[] = [],
  locale: Locale = DEFAULT_LOCALE,
): TaskIssue[] {
  const screenshotById = new Map(
    screenshots.map((item) => [item.violationId, item.path] as const),
  );
  const analysisById = new Map(
    analyzed
      .filter((item): item is AnalyzedViolation & { violationId: string } =>
        Boolean(item.violationId),
      )
      .map((item) => [item.violationId, item] as const),
  );

  const issues: TaskIssue[] = [];
  let index = 1;

  for (const page of scanResults) {
    for (const violation of page.violations) {
      const violationId = formatViolationScreenshotId(index);
      const ai = analysisById.get(violationId);
      const screenshotPath = screenshotById.get(violationId) ?? null;

      issues.push(
        toTaskIssue({
          violationId,
          url: page.url,
          violation,
          screenshotPath,
          ai,
          locale,
        }),
      );

      index += 1;
    }
  }

  return issues;
}

function toTaskIssue(params: {
  violationId: string;
  url: string;
  violation: AccessibilityViolation;
  screenshotPath: string | null;
  ai: AnalyzedViolation | undefined;
  locale: Locale;
}): TaskIssue {
  const { violationId, url, violation, screenshotPath, ai, locale } = params;
  const t = getTaskStrings(locale);

  if (ai) {
    return {
      violationId,
      title: `${violationId}: ${ai.analysis.title}`,
      priority: toTaskPriority(ai.analysis.priority),
      url,
      selector: violation.selector,
      screenshotPath,
      problem: ai.analysis.developerExplanation || ai.analysis.summary,
      userImpact: ai.analysis.uxImpact,
      recommendedFix: formatRecommendedFix(ai.analysis.suggestedFix, violation.html, t),
      wcagReference: formatWcagReference(violation, t),
      ruleId: violation.id,
      description: violation.description || violation.help,
      helpUrl: violation.helpUrl,
    };
  }

  return {
    violationId,
    title: `${violationId}: ${violation.help || violation.id}`,
    priority: impactToPriority(violation.impact),
    url,
    selector: violation.selector,
    screenshotPath,
    problem: [
      violation.description || violation.help,
      violation.failureSummary ? `\n\n${violation.failureSummary}` : '',
    ]
      .join('')
      .trim(),
    userImpact: impactToUserImpact(violation.impact, violation.help, t),
    recommendedFix: formatRecommendedFix(t.fallbackRecommendedFix, violation.html, t),
    wcagReference: formatWcagReference(violation, t),
    ruleId: violation.id,
    description: violation.description || violation.help,
    helpUrl: violation.helpUrl,
  };
}

function formatWcagReference(violation: AccessibilityViolation, t: TaskStrings): string {
  const lines = [
    `- ${t.ruleId}: \`${violation.id}\``,
    `- ${t.impact}: ${violation.impact || t.unknown}`,
    `- ${t.description}: ${violation.description || violation.help}`,
  ];

  if (violation.helpUrl) {
    lines.push(`- ${t.help}: ${violation.helpUrl}`);
  }

  return lines.join('\n');
}

function formatRecommendedFix(suggestion: string, html: string, t: TaskStrings): string {
  const parts = [suggestion.trim()];

  if (html.trim()) {
    parts.push('', t.affectedHtml, '', '```html', html.trim(), '```');
  }

  return parts.join('\n');
}

function formatScreenshotLine(
  screenshotPath: string | null,
  tasksDir: string,
  t: TaskStrings,
): string {
  if (!screenshotPath) {
    return t.noScreenshot;
  }

  const absoluteScreenshot = path.resolve(screenshotPath);
  const relative = path.relative(tasksDir, absoluteScreenshot).split(path.sep).join('/');

  return [`\`${relative}\``, '', `![Violation screenshot](${relative})`].join('\n');
}

export function toTaskPriority(priority: string): TaskPriority {
  switch (priority.trim().toLowerCase()) {
    case 'critical':
      return 'Critical';
    case 'high':
    case 'serious':
      return 'High';
    case 'medium':
    case 'moderate':
      return 'Medium';
    case 'low':
    case 'minor':
      return 'Low';
    default:
      return 'Medium';
  }
}

function impactToPriority(impact: string): TaskPriority {
  return toTaskPriority(impact);
}

function impactToUserImpact(impact: string, help: string, t: TaskStrings): string {
  const normalized = impact.trim().toLowerCase() || 'unknown';
  const base =
    normalized === 'critical' || normalized === 'serious'
      ? t.impactCritical
      : normalized === 'moderate'
        ? t.impactModerate
        : t.impactLow;

  return help ? `${base} ${help}` : base;
}
