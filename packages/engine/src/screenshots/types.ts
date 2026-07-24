/**
 * Screenshot module types.
 */

import type { Page } from 'playwright';

export type {
  ViolationScreenshotResult,
  CaptureViolationScreenshotsOptions,
} from '@a11y-agent-ops/shared';

export interface GenerateViolationScreenshotOptions {
  /** Page URL that contains the violation */
  url: string;
  /** CSS selector for the affected element (from axe-core) */
  selector: string;
  /** Screenshot / label id, e.g. A11Y-001 */
  violationId: string;
  /** Output directory (default: .a11y-ops-report/screenshots) */
  outputDir?: string;
  /** Navigation timeout in milliseconds */
  timeoutMs?: number;
  /**
   * Reuse an existing Playwright page.
   * When omitted, a short-lived Chromium instance is launched.
   */
  page?: Page;
}

export class ScreenshotError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'ScreenshotError';
    this.code = code;
  }
}

export const DEFAULT_SCREENSHOTS_DIR = '.a11y-ops-report/screenshots';
