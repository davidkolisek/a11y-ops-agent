import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AnalyzedViolation } from '../ai/types.js';
import { DEFAULT_LOCALE, getReportStrings, type ReportStrings } from '../i18n/index.js';
import {
  DEFAULT_REPORT_DIR,
  ReportError,
  type GenerateHtmlReportOptions,
  type HtmlReportDashboard,
  type HtmlReportData,
  type HtmlReportIssue,
  type TaskIssue,
  type TaskPriority,
} from './types.js';

/**
 * Compute dashboard metrics and accessibility score (0–100).
 *
 * Score starts at 100 and deducts:
 * Critical ×12, High ×6, Medium ×3, Low ×1 (floored at 0).
 */
export function buildDashboard(
  issues: Array<{ priority: TaskPriority }>,
  pagesScanned: number,
): HtmlReportDashboard {
  const criticalIssues = issues.filter((issue) => issue.priority === 'Critical').length;
  const highIssues = issues.filter((issue) => issue.priority === 'High').length;
  const mediumIssues = issues.filter((issue) => issue.priority === 'Medium').length;
  const lowIssues = issues.filter((issue) => issue.priority === 'Low').length;
  const totalIssues = issues.length;

  const deductions = criticalIssues * 12 + highIssues * 6 + mediumIssues * 3 + lowIssues * 1;
  const accessibilityScore = Math.max(0, Math.min(100, 100 - deductions));

  return {
    accessibilityScore,
    pagesScanned,
    totalIssues,
    criticalIssues,
    highIssues,
    mediumIssues,
    lowIssues,
  };
}

/**
 * Map task issues (+ optional AI) into HTML report issue cards.
 */
export function buildHtmlReportIssues(
  issues: TaskIssue[],
  reportDir: string,
  analyzed: AnalyzedViolation[] = [],
): HtmlReportIssue[] {
  const analysisById = new Map(
    analyzed
      .filter((item): item is AnalyzedViolation & { violationId: string } =>
        Boolean(item.violationId),
      )
      .map((item) => [item.violationId, item] as const),
  );

  return issues.map((issue) => {
    const ai = analysisById.get(issue.violationId);
    const screenshotSrc = issue.screenshotPath
      ? toPosixRelative(reportDir, issue.screenshotPath)
      : null;

    const suggestedFix = ai
      ? ai.analysis.suggestedFix
      : stripAffectedHtmlBlock(issue.recommendedFix);

    const aiExplanation = ai
      ? [ai.analysis.developerExplanation, ai.analysis.uxImpact].filter(Boolean).join('\n\n')
      : issue.problem;

    return {
      violationId: issue.violationId,
      title: issue.title,
      priority: issue.priority,
      url: issue.url,
      selector: issue.selector,
      ruleId: issue.ruleId ?? extractRuleId(issue.wcagReference) ?? 'unknown',
      description: issue.description ?? issue.problem.split('\n')[0] ?? issue.title,
      helpUrl: issue.helpUrl ?? extractHelpUrl(issue.wcagReference) ?? '',
      aiExplanation,
      suggestedFix,
      screenshotSrc,
      taskHref: `tasks/${issue.violationId}.md`,
    };
  });
}

/**
 * Render a complete self-contained HTML accessibility report.
 */
export function renderHtmlReport(data: HtmlReportData): string {
  const { dashboard } = data;
  const t = getReportStrings(data.locale);
  const scoreClass = scoreTone(dashboard.accessibilityScore);

  return `<!DOCTYPE html>
<html lang="${escapeHtml(t.htmlLang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(t.reportDocumentTitle)}</title>
  <style>
${REPORT_CSS}
  </style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">a11y-ops-agent</p>
        <h1>${escapeHtml(t.accessibilityReport)}</h1>
        <p class="meta">
          ${escapeHtml(t.target)}: <a href="${escapeHtml(data.targetUrl)}">${escapeHtml(data.targetUrl)}</a>
          · WCAG ${escapeHtml(data.wcagLevel)}
          · ${escapeHtml(t.generated)} ${escapeHtml(formatDate(data.generatedAt, t.dateLocale))}
        </p>
      </div>
      <div class="score-card ${scoreClass}" aria-label="${escapeHtml(t.accessibilityScore)} ${String(dashboard.accessibilityScore)} / 100">
        <span class="score-label">${escapeHtml(t.accessibilityScore)}</span>
        <span class="score-value">${String(dashboard.accessibilityScore)}</span>
        <span class="score-max">/ 100</span>
      </div>
    </header>

    <section class="dashboard" aria-label="Dashboard">
      <article class="stat">
        <span class="stat-label">${escapeHtml(t.pagesScanned)}</span>
        <span class="stat-value">${String(dashboard.pagesScanned)}</span>
      </article>
      <article class="stat">
        <span class="stat-label">${escapeHtml(t.totalIssues)}</span>
        <span class="stat-value">${String(dashboard.totalIssues)}</span>
      </article>
      <article class="stat critical">
        <span class="stat-label">${escapeHtml(t.critical)}</span>
        <span class="stat-value">${String(dashboard.criticalIssues)}</span>
      </article>
      <article class="stat high">
        <span class="stat-label">${escapeHtml(t.high)}</span>
        <span class="stat-value">${String(dashboard.highIssues)}</span>
      </article>
      <article class="stat medium">
        <span class="stat-label">${escapeHtml(t.medium)}</span>
        <span class="stat-value">${String(dashboard.mediumIssues)}</span>
      </article>
    </section>

    <section class="issues" aria-label="${escapeHtml(t.issues)}">
      <div class="section-head">
        <h2>${escapeHtml(t.issues)}</h2>
        <p>${escapeHtml(t.findings(data.issues.length))}</p>
      </div>
      ${data.issues.length === 0 ? renderEmptyState(t) : data.issues.map((issue) => renderIssueCard(issue, t)).join('\n')}
    </section>
  </div>
</body>
</html>
`;
}

/**
 * Write `.a11y-ops-report/index.html` for the given task issues.
 * @returns Absolute path to the HTML file
 */
export async function generateHtmlReport(
  issues: TaskIssue[],
  options: GenerateHtmlReportOptions,
  analyzed: AnalyzedViolation[] = [],
): Promise<string> {
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_REPORT_DIR);
  const locale = options.locale ?? DEFAULT_LOCALE;

  try {
    await mkdir(outputDir, { recursive: true });
  } catch (cause) {
    throw new ReportError(
      `Failed to create report directory: ${outputDir}`,
      'REPORT_DIR_FAILED',
      cause,
    );
  }

  const dashboard = buildDashboard(issues, options.pagesScanned);
  const reportIssues = buildHtmlReportIssues(issues, outputDir, analyzed);

  const data: HtmlReportData = {
    generatedAt: new Date().toISOString(),
    targetUrl: options.targetUrl,
    wcagLevel: options.wcagLevel ?? 'AA',
    locale,
    dashboard,
    issues: reportIssues,
  };

  const htmlPath = path.join(outputDir, 'index.html');

  try {
    await writeFile(htmlPath, renderHtmlReport(data), 'utf8');
  } catch (cause) {
    throw new ReportError(`Failed to write HTML report: ${htmlPath}`, 'HTML_WRITE_FAILED', cause);
  }

  return htmlPath;
}

function renderEmptyState(t: ReportStrings): string {
  return `<article class="empty">
    <h3>${escapeHtml(t.emptyTitle)}</h3>
    <p>${escapeHtml(t.emptyBody)}</p>
  </article>`;
}

function renderIssueCard(issue: HtmlReportIssue, t: ReportStrings): string {
  const priorityClass = issue.priority.toLowerCase();
  const screenshot = issue.screenshotSrc
    ? `<a class="shot" href="${escapeHtml(issue.screenshotSrc)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(issue.screenshotSrc)}" alt="Screenshot for ${escapeHtml(issue.violationId)}" loading="lazy" />
      </a>`
    : `<div class="shot placeholder" role="img" aria-label="${escapeHtml(t.noScreenshot)}">${escapeHtml(t.noScreenshot)}</div>`;

  const helpLink = issue.helpUrl
    ? `<a href="${escapeHtml(issue.helpUrl)}" target="_blank" rel="noopener">${escapeHtml(issue.ruleId)}</a>`
    : `<code>${escapeHtml(issue.ruleId)}</code>`;

  return `<article class="issue" id="${escapeHtml(issue.violationId)}">
    <div class="issue-media">${screenshot}</div>
    <div class="issue-body">
      <div class="issue-top">
        <span class="badge ${priorityClass}">${escapeHtml(t.priorityLabel(issue.priority))}</span>
        <span class="issue-id">${escapeHtml(issue.violationId)}</span>
      </div>
      <h3>${escapeHtml(issue.title)}</h3>
      <dl class="facts">
        <div>
          <dt>${escapeHtml(t.url)}</dt>
          <dd><a href="${escapeHtml(issue.url)}" target="_blank" rel="noopener">${escapeHtml(issue.url)}</a></dd>
        </div>
        <div>
          <dt>${escapeHtml(t.wcagRule)}</dt>
          <dd>${helpLink}</dd>
        </div>
        <div>
          <dt>${escapeHtml(t.selector)}</dt>
          <dd><code>${escapeHtml(issue.selector || t.none)}</code></dd>
        </div>
      </dl>
      <div class="block">
        <h4>${escapeHtml(t.description)}</h4>
        <p>${escapeHtml(issue.description)}</p>
      </div>
      <div class="block">
        <h4>${escapeHtml(t.aiExplanation)}</h4>
        <p>${nl2br(escapeHtml(issue.aiExplanation))}</p>
      </div>
      <div class="block">
        <h4>${escapeHtml(t.suggestedFix)}</h4>
        <pre><code>${escapeHtml(issue.suggestedFix)}</code></pre>
      </div>
      <p class="task-link">
        <a href="${escapeHtml(issue.taskHref)}">${escapeHtml(t.openMarkdownTask(issue.violationId))}</a>
      </p>
    </div>
  </article>`;
}

function stripAffectedHtmlBlock(recommendedFix: string): string {
  const markers = ['\n\nAffected HTML:', '\n\nPostihnuté HTML:'];
  for (const marker of markers) {
    const index = recommendedFix.indexOf(marker);
    if (index !== -1) {
      return recommendedFix.slice(0, index).trim();
    }
  }
  return recommendedFix.trim();
}

function extractRuleId(wcagReference: string): string | null {
  const match = /(?:Rule ID|ID pravidla):\s*`([^`]+)`/i.exec(wcagReference);
  return match?.[1] ?? null;
}

function extractHelpUrl(wcagReference: string): string | null {
  const match = /- (?:Help|Pomoc):\s*(\S+)/i.exec(wcagReference);
  return match?.[1] ?? null;
}

function toPosixRelative(fromDir: string, absoluteTarget: string): string {
  return path.relative(fromDir, path.resolve(absoluteTarget)).split(path.sep).join('/');
}

function scoreTone(score: number): string {
  if (score >= 90) return 'good';
  if (score >= 70) return 'ok';
  if (score >= 40) return 'warn';
  return 'bad';
}

function formatDate(iso: string, dateLocale: string): string {
  try {
    return new Date(iso).toLocaleString(dateLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function nl2br(value: string): string {
  return value.replaceAll('\n', '<br />');
}

const REPORT_CSS = `
    :root {
      --bg: #f3f1ec;
      --surface: #fffcf7;
      --ink: #1c1917;
      --muted: #57534e;
      --line: #e7e0d5;
      --critical: #b91c1c;
      --high: #c2410c;
      --medium: #a16207;
      --low: #3f6212;
      --accent: #0f766e;
      --shadow: 0 10px 30px rgba(28, 25, 23, 0.08);
      --radius: 18px;
      --font: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--font);
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 40%),
        radial-gradient(circle at top right, rgba(185, 28, 28, 0.08), transparent 35%),
        var(--bg);
      line-height: 1.5;
    }
    a { color: var(--accent); }
    code, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.92em;
    }
    .page {
      width: min(1120px, calc(100% - 2rem));
      margin: 2rem auto 3rem;
    }
    .hero {
      display: flex;
      gap: 1.5rem;
      justify-content: space-between;
      align-items: stretch;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .eyebrow {
      margin: 0 0 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--accent);
    }
    h1 {
      margin: 0 0 0.5rem;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      line-height: 1.1;
    }
    .meta {
      margin: 0;
      color: var(--muted);
      max-width: 42rem;
    }
    .score-card {
      min-width: 180px;
      padding: 1.1rem 1.25rem;
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
      border: 1px solid var(--line);
      display: grid;
      align-content: center;
      gap: 0.15rem;
    }
    .score-label {
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .score-value {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1;
    }
    .score-max { color: var(--muted); }
    .score-card.good .score-value { color: #15803d; }
    .score-card.ok .score-value { color: #a16207; }
    .score-card.warn .score-value { color: #c2410c; }
    .score-card.bad .score-value { color: #b91c1c; }

    .dashboard {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0.85rem;
      margin-bottom: 1.75rem;
    }
    .stat {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 1rem;
      box-shadow: var(--shadow);
    }
    .stat-label {
      display: block;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .stat-value {
      font-size: 1.7rem;
      font-weight: 800;
    }
    .stat.critical .stat-value { color: var(--critical); }
    .stat.high .stat-value { color: var(--high); }
    .stat.medium .stat-value { color: var(--medium); }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .section-head h2 { margin: 0; font-size: 1.35rem; }
    .section-head p { margin: 0; color: var(--muted); }

    .issue {
      display: grid;
      grid-template-columns: minmax(220px, 320px) 1fr;
      gap: 1.25rem;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 1.1rem;
      box-shadow: var(--shadow);
      margin-bottom: 1rem;
    }
    .issue-media { min-width: 0; }
    .shot {
      display: block;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid var(--line);
      background: #efeae2;
      aspect-ratio: 4 / 3;
    }
    .shot img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .shot.placeholder {
      display: grid;
      place-items: center;
      color: var(--muted);
      font-weight: 600;
      min-height: 180px;
    }
    .issue-top {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      background: var(--medium);
    }
    .badge.critical { background: var(--critical); }
    .badge.high { background: var(--high); }
    .badge.medium { background: var(--medium); }
    .badge.low { background: var(--low); }
    .issue-id {
      color: var(--muted);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .issue-body h3 {
      margin: 0 0 0.85rem;
      font-size: 1.15rem;
      line-height: 1.3;
    }
    .facts {
      display: grid;
      gap: 0.65rem;
      margin: 0 0 1rem;
    }
    .facts div {
      display: grid;
      grid-template-columns: 7rem 1fr;
      gap: 0.75rem;
      padding-bottom: 0.55rem;
      border-bottom: 1px solid var(--line);
    }
    .facts dt {
      margin: 0;
      color: var(--muted);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .facts dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .block { margin-bottom: 0.95rem; }
    .block h4 {
      margin: 0 0 0.35rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
    }
    .block p { margin: 0; }
    .block pre {
      margin: 0;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      background: #1c1917;
      color: #f5f5f4;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .task-link { margin: 0; }
    .task-link a {
      font-weight: 700;
      text-decoration: none;
      border-bottom: 1px solid currentColor;
    }
    .empty {
      background: var(--surface);
      border: 1px dashed var(--line);
      border-radius: var(--radius);
      padding: 2rem;
      text-align: center;
    }
    .empty h3 { margin: 0 0 0.4rem; }
    .empty p { margin: 0; color: var(--muted); }

    @media (max-width: 900px) {
      .dashboard { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .issue { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .page { width: min(100% - 1.25rem, 1120px); margin-top: 1rem; }
      .dashboard { grid-template-columns: 1fr 1fr; }
      .facts div { grid-template-columns: 1fr; gap: 0.2rem; }
    }
`;
