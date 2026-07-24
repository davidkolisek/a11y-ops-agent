import type { Locale } from './locale.js';
import type { WcagLevel } from './scanner.js';

export interface AiConfig {
  /** When false, AI analysis is skipped. When true, runs if OPENAI_API_KEY is set. */
  enabled: boolean;
}

/**
 * Project configuration (a11y-ops.config.ts and runtime AppConfig).
 */
export interface UserConfig {
  maxPages: number;
  ignorePaths: string[];
  includePaths: string[];
  ai: AiConfig;
  wcagLevel: WcagLevel;
  /** Report / task / AI output language. Default English; use `sk` for Slovak. */
  locale: Locale;
  /**
   * Optional project folder name under `.a11y-ops-report/<project>/`.
   * When omitted, derived from the target URL hostname.
   */
  projectName?: string;
  timeoutMs: number;
  reportsDir: string;
  screenshotsDir: string;
  tasksDir: string;
}

export type AppConfig = UserConfig;
