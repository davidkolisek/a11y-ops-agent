import type { PageScanResult } from '../scanner/types.js';
import type { ViolationScreenshotResult } from '../screenshots/types.js';
import { formatViolationScreenshotId } from '../screenshots/index.js';
import type { ViolationAnalysisInput } from './types.js';

export interface ViolationAnalysisJob {
  violationId: string;
  input: ViolationAnalysisInput;
}

/**
 * Pair scanned violations with screenshot paths (by sequential A11Y-00N order).
 */
export function buildAnalysisJobs(
  scanResults: PageScanResult[],
  screenshots: ViolationScreenshotResult[] = [],
): ViolationAnalysisJob[] {
  const screenshotById = new Map(
    screenshots.map((item) => [item.violationId, item.path] as const),
  );

  const jobs: ViolationAnalysisJob[] = [];
  let index = 1;

  for (const page of scanResults) {
    for (const violation of page.violations) {
      const violationId = formatViolationScreenshotId(index);
      const screenshotPath = screenshotById.get(violationId) ?? null;

      jobs.push({
        violationId,
        input: {
          rule: violation.id,
          description: violation.description || violation.help,
          html: violation.html,
          selector: violation.selector,
          screenshotPath,
          url: page.url,
        },
      });

      index += 1;
    }
  }

  return jobs;
}
