/**
 * Screenshot module types (Playwright page handle stays in the engine).
 */

export interface ViolationScreenshotResult {
  violationId: string;
  url: string;
  selector: string;
  /** Absolute path when captured; null when the selector was missing or capture failed */
  path: string | null;
  skippedReason?: string;
}

export interface CaptureViolationScreenshotsOptions {
  outputDir?: string;
  timeoutMs?: number;
  onScreenshot?: (result: ViolationScreenshotResult, index: number, total: number) => void;
}
