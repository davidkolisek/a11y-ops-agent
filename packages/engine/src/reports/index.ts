export {
  renderTaskMarkdown,
  generateTaskFile,
  generateTasks,
  buildTaskIssues,
  toTaskPriority,
} from './task-generator.js';
export {
  buildDashboard,
  buildHtmlReportIssues,
  renderHtmlReport,
  generateHtmlReport,
} from './html-report.js';
export {
  ReportError,
  DEFAULT_TASKS_DIR,
  DEFAULT_REPORT_DIR,
  type TaskIssue,
  type TaskPriority,
  type GenerateTasksOptions,
  type GenerateTasksResult,
  type HtmlReportDashboard,
  type HtmlReportIssue,
  type HtmlReportData,
  type GenerateHtmlReportOptions,
} from './types.js';

export type ReportFormat = 'json' | 'html' | 'console' | 'tasks';
