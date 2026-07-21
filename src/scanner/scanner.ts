import { AxeBuilder } from '@axe-core/playwright';
import type { Result as AxeViolation, NodeResult } from 'axe-core';
import { chromium, type Browser, type Page } from 'playwright';

import {
  ScanError,
  type AccessibilityViolation,
  type PageScanResult,
  type ScanPagesOptions,
  type ScanRunResult,
  type WcagLevel,
} from './types.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_WCAG_LEVEL: WcagLevel = 'AA';

/**
 * axe-core tags for each WCAG level.
 * Higher levels include all lower-level tags (A ⊂ AA ⊂ AAA).
 */
const WCAG_TAGS: Record<WcagLevel, string[]> = {
  A: ['wcag2a', 'wcag21a', 'wcag22a'],
  AA: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
  AAA: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag21aaa',
    'wcag22a',
    'wcag22aa',
    'wcag22aaa',
  ],
};

/**
 * Run axe-core accessibility analysis for every crawled page.
 * Only violations are reported — passes, incomplete, and inapplicable are omitted.
 */
export async function scanPages(options: ScanPagesOptions): Promise<ScanRunResult> {
  const wcagLevel = options.wcagLevel ?? DEFAULT_WCAG_LEVEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const pages = options.pages;

  if (!isWcagLevel(wcagLevel)) {
    throw new ScanError(
      `Invalid WCAG level: "${String(wcagLevel)}". Expected A, AA, or AAA.`,
      'INVALID_WCAG_LEVEL',
    );
  }

  if (pages.length === 0) {
    return {
      results: [],
      failedUrls: [],
      wcagLevel,
      totalViolations: 0,
    };
  }

  let browser: Browser | undefined;
  const results: PageScanResult[] = [];
  const failedUrls: string[] = [];

  try {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (cause) {
      throw new ScanError(
        'Failed to launch Chromium. Run `npx playwright install chromium` and try again.',
        'BROWSER_LAUNCH_FAILED',
        cause,
      );
    }

    const context = await browser.newContext({
      javaScriptEnabled: true,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);
    page.setDefaultNavigationTimeout(timeoutMs);

    for (let index = 0; index < pages.length; index += 1) {
      const target = pages[index];
      if (!target) {
        continue;
      }

      try {
        const result = await scanSinglePage(page, target.url, wcagLevel, timeoutMs);
        results.push(result);
        options.onPageScanned?.(result, index + 1, pages.length);
      } catch (error) {
        failedUrls.push(target.url);
        const normalized = error instanceof Error ? error : new Error(String(error));
        options.onPageError?.(target.url, normalized);
      }
    }

    await context.close();
  } finally {
    await browser?.close();
  }

  const totalViolations = results.reduce((sum, page) => sum + page.violations.length, 0);

  return {
    results,
    failedUrls,
    wcagLevel,
    totalViolations,
  };
}

async function scanSinglePage(
  page: Page,
  url: string,
  wcagLevel: WcagLevel,
  timeoutMs: number,
): Promise<PageScanResult> {
  const response = await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: timeoutMs,
  });

  await page.waitForLoadState('domcontentloaded');
  await settle(250);

  if (response !== null && response.status() >= 400) {
    throw new ScanError(`HTTP ${String(response.status())} for ${url}`, 'HTTP_ERROR');
  }

  const axeResults = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS[wcagLevel])
    .analyze();

  const pageUrl = page.url();
  const violations = axeResults.violations.flatMap((violation) =>
    mapViolationNodes(violation),
  );

  return {
    url: pageUrl,
    violations,
  };
}

/**
 * Expand each axe violation node into a flat report entry.
 */
function mapViolationNodes(violation: AxeViolation): AccessibilityViolation[] {
  return violation.nodes.map((node) => mapNode(violation, node));
}

function mapNode(violation: AxeViolation, node: NodeResult): AccessibilityViolation {
  return {
    id: violation.id,
    impact: violation.impact ?? node.impact ?? '',
    description: violation.description,
    selector: formatSelector(node.target),
    html: node.html,
    help: violation.help,
    helpUrl: violation.helpUrl,
    failureSummary: node.failureSummary ?? '',
  };
}

function formatSelector(target: NodeResult['target']): string {
  return target
    .map((part) => (typeof part === 'string' ? part : JSON.stringify(part)))
    .join(', ');
}

export function isWcagLevel(value: string): value is WcagLevel {
  return value === 'A' || value === 'AA' || value === 'AAA';
}

export function resolveWcagTags(level: WcagLevel): string[] {
  return [...WCAG_TAGS[level]];
}

function settle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { DEFAULT_TIMEOUT_MS, DEFAULT_WCAG_LEVEL, WCAG_TAGS };
