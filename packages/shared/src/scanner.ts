/**
 * Scanner domain types — axe-core accessibility results.
 */

export type WcagLevel = 'A' | 'AA' | 'AAA';

export interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
  selector: string;
  html: string;
  help: string;
  helpUrl: string;
  /** Per-node failure details from axe-core */
  failureSummary: string;
}

export interface PageScanResult {
  url: string;
  violations: AccessibilityViolation[];
}

export interface ScanPagesOptions {
  /** Pages to scan (typically from the crawler) */
  pages: Array<{ url: string }>;
  /** WCAG conformance level (default: AA) */
  wcagLevel?: WcagLevel;
  /** Navigation / analysis timeout in milliseconds */
  timeoutMs?: number;
  /** Progress callback after each page is scanned */
  onPageScanned?: (result: PageScanResult, index: number, total: number) => void;
  /** Called when a single page scan fails (scan continues) */
  onPageError?: (url: string, error: Error) => void;
}

export interface ScanRunResult {
  results: PageScanResult[];
  failedUrls: string[];
  wcagLevel: WcagLevel;
  totalViolations: number;
}
