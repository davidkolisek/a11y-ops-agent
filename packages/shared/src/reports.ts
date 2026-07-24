/**
 * Types for Jira-ready Markdown accessibility tasks and HTML reports.
 */

import type { Locale } from './locale.js';

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface TaskIssue {
  /** Stable id used for the filename, e.g. A11Y-001 */
  violationId: string;
  title: string;
  priority: TaskPriority;
  url: string;
  selector: string;
  /** Absolute path to screenshot when available */
  screenshotPath: string | null;
  problem: string;
  userImpact: string;
  recommendedFix: string;
  /** WCAG / axe rule details (id, description, help URL) */
  wcagReference: string;
  /** axe-core rule id */
  ruleId?: string;
  /** Short rule description / help text */
  description?: string;
  /** Deque / WCAG help URL */
  helpUrl?: string;
}

export interface GenerateTasksOptions {
  /** Output directory (default: .a11y-ops-report/tasks) */
  outputDir?: string;
  locale?: Locale;
  onTaskWritten?: (filePath: string, issue: TaskIssue, index: number, total: number) => void;
}

export interface GenerateTasksResult {
  outputDir: string;
  files: string[];
}

export interface HtmlReportDashboard {
  accessibilityScore: number;
  pagesScanned: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

export interface HtmlReportIssue {
  violationId: string;
  title: string;
  priority: TaskPriority;
  url: string;
  selector: string;
  ruleId: string;
  description: string;
  helpUrl: string;
  aiExplanation: string;
  suggestedFix: string;
  /** Path relative to the HTML report file */
  screenshotSrc: string | null;
  /** Path relative to the HTML report file */
  taskHref: string;
}

export interface HtmlReportData {
  generatedAt: string;
  targetUrl: string;
  wcagLevel: string;
  locale: Locale;
  dashboard: HtmlReportDashboard;
  issues: HtmlReportIssue[];
}

export interface GenerateHtmlReportOptions {
  /** Report root directory (default: .a11y-ops-report) — writes index.html here */
  outputDir?: string;
  targetUrl: string;
  wcagLevel?: string;
  pagesScanned: number;
  locale?: Locale;
}
