import type { Locale } from './locale.js';
import type { TaskIssue, HtmlReportDashboard } from './reports.js';
import type { AnalyzedViolation } from './ai.js';
import type { WcagLevel } from './scanner.js';

export type AiMode = 'auto' | 'on' | 'off';

/**
 * Options for the engine `scan()` API.
 * The engine never writes to stdout — use `onProgress` for UI/CLI feedback.
 */
export interface ScanOptions {
  url: string;
  /** Explicit overrides — only set keys the caller intends to force */
  cliOverrides?: {
    maxPages?: number;
    wcagLevel?: WcagLevel;
    aiMode?: AiMode;
    locale?: Locale;
    projectName?: string;
  };
  /** Optional explicit config file path */
  configPath?: string;
  /** When true, progress events include per-page / per-issue detail */
  verbose?: boolean;
  /** Progress / status events for hosts (CLI, web, etc.) */
  onProgress?: (event: ScanProgressEvent) => void;
}

export type ScanProgressEvent =
  | { type: 'message'; message: string }
  | { type: 'ok'; message: string }
  | { type: 'skip'; message: string }
  | { type: 'blank' };

/**
 * Result of a full accessibility audit.
 * Artifact paths are populated when the engine persists reports/tasks/screenshots.
 */
export interface AccessibilityReport {
  targetUrl: string;
  pagesFound: number;
  issuesFound: number;
  reportPath: string;
  tasksDir: string;
  projectSlug: string;
  aiRan: boolean;
  configPath: string | null;
  /** Dashboard metrics when issues were built */
  dashboard?: HtmlReportDashboard;
  issues?: TaskIssue[];
  analyzed?: AnalyzedViolation[];
}
