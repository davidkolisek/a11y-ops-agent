/**
 * Scanner domain types — re-export shared interfaces + engine error class.
 */

export type {
  WcagLevel,
  AccessibilityViolation,
  PageScanResult,
  ScanPagesOptions,
  ScanRunResult,
} from '@a11y-agent-ops/shared';

export class ScanError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'ScanError';
    this.code = code;
  }
}
