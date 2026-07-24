/**
 * Types for Jira-ready Markdown accessibility tasks and HTML reports.
 */

export type {
  TaskPriority,
  TaskIssue,
  GenerateTasksOptions,
  GenerateTasksResult,
  HtmlReportDashboard,
  HtmlReportIssue,
  HtmlReportData,
  GenerateHtmlReportOptions,
} from '@a11y-agent-ops/shared';

export class ReportError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'ReportError';
    this.code = code;
  }
}

export const DEFAULT_TASKS_DIR = '.a11y-ops-report/tasks';
export const DEFAULT_REPORT_DIR = '.a11y-ops-report';
