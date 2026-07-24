/**
 * Re-export shared domain types for the web app.
 * Do not import `@a11y-agent-ops/engine` into the Vite bundle.
 */
export type {
  AccessibilityReport,
  ScanOptions,
  ScanProgressEvent,
  TaskIssue,
  TaskPriority,
  HtmlReportDashboard,
  AnalyzedViolation,
  WcagLevel,
  Locale,
} from '@a11y-agent-ops/shared'
