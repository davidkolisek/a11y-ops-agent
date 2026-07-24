/**
 * Crawler domain types — re-export shared interfaces + engine error class.
 */

export type {
  CrawledPage,
  CrawlOptions,
  CrawlResult,
} from '@a11y-agent-ops/shared';

export class CrawlError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'CrawlError';
    this.code = code;
  }
}
