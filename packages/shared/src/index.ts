export {
  LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from './locale.js';

export type {
  WcagLevel,
  AccessibilityViolation,
  PageScanResult,
  ScanPagesOptions,
  ScanRunResult,
} from './scanner.js';

export type {
  CrawledPage,
  CrawlOptions,
  CrawlResult,
} from './crawler.js';

export type {
  TaskPriority,
  TaskIssue,
  GenerateTasksOptions,
  GenerateTasksResult,
  HtmlReportDashboard,
  HtmlReportIssue,
  HtmlReportData,
  GenerateHtmlReportOptions,
} from './reports.js';

export type {
  ViolationScreenshotResult,
  CaptureViolationScreenshotsOptions,
} from './screenshots.js';

export type {
  ViolationAnalysisInput,
  ViolationAnalysis,
  AnalyzedViolation,
  AnalyzeViolationOptions,
  AiTokenUsage,
  AnalyzeViolationResult,
  AnalyzeViolationsOptions,
  ViolationAnalysisJob,
} from './ai.js';

export type { AiConfig, UserConfig, AppConfig } from './config.js';

export type {
  AiMode,
  ScanOptions,
  ScanProgressEvent,
  AccessibilityReport,
} from './scan.js';
