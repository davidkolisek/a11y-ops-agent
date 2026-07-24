import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { type Browser, type Page } from 'playwright';

import { launchChromium } from '../browser/index.js';
import type { PageScanResult } from '../scanner/types.js';
import {
  DEFAULT_SCREENSHOTS_DIR,
  ScreenshotError,
  type CaptureViolationScreenshotsOptions,
  type GenerateViolationScreenshotOptions,
  type ViolationScreenshotResult,
} from './types.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const HIGHLIGHT_STYLE_ID = 'a11y-ops-agent-violation-highlight';

/**
 * Capture a cropped screenshot for a single accessibility violation.
 *
 * Highlights the affected element with a red outline and a small label
 * showing the violation id (e.g. A11Y-001), then crops around that region.
 *
 * @returns Absolute screenshot path, or `null` when the selector is unavailable.
 */
export async function generateViolationScreenshot(
  options: GenerateViolationScreenshotOptions,
): Promise<string | null> {
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_SCREENSHOTS_DIR);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const outputPath = path.join(outputDir, `${options.violationId}.png`);

  await mkdir(outputDir, { recursive: true });

  if (options.page) {
    return captureOnPage(options.page, {
      url: options.url,
      selector: options.selector,
      violationId: options.violationId,
      outputPath,
      timeoutMs,
    });
  }

  let browser: Browser | undefined;

  try {
    try {
      browser = await launchChromium({ headless: true });
    } catch (cause) {
      throw new ScreenshotError(
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

    const result = await captureOnPage(page, {
      url: options.url,
      selector: options.selector,
      violationId: options.violationId,
      outputPath,
      timeoutMs,
    });

    await context.close();
    return result;
  } finally {
    await browser?.close();
  }
}

/**
 * Capture screenshots for every violation across scanned pages.
 * Reuses one Chromium instance and reloads only when the page URL changes.
 */
export async function captureViolationScreenshots(
  scanResults: PageScanResult[],
  options: CaptureViolationScreenshotsOptions = {},
): Promise<ViolationScreenshotResult[]> {
  const outputDir = path.resolve(options.outputDir ?? DEFAULT_SCREENSHOTS_DIR);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const jobs = flattenViolations(scanResults);
  if (jobs.length === 0) {
    return [];
  }

  await mkdir(outputDir, { recursive: true });

  let browser: Browser | undefined;
  const results: ViolationScreenshotResult[] = [];

  try {
    try {
      browser = await launchChromium({ headless: true });
    } catch (cause) {
      throw new ScreenshotError(
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

    let lastUrl: string | undefined;

    for (let index = 0; index < jobs.length; index += 1) {
      const job = jobs[index];
      if (!job) {
        continue;
      }

      let screenshotPath: string | null = null;
      let skippedReason: string | undefined;

      try {
        if (lastUrl !== job.url) {
          await page.goto(job.url, { waitUntil: 'networkidle', timeout: timeoutMs });
          await page.waitForLoadState('domcontentloaded');
          await settle(250);
          lastUrl = job.url;
        } else {
          await clearHighlight(page);
        }

        screenshotPath = await generateViolationScreenshot({
          url: job.url,
          selector: job.selector,
          violationId: job.violationId,
          outputDir,
          timeoutMs,
          page,
        });

        if (screenshotPath === null) {
          skippedReason = 'Selector not found on page';
        }
      } catch (error) {
        skippedReason = error instanceof Error ? error.message : String(error);
        screenshotPath = null;
      }

      const result: ViolationScreenshotResult = {
        violationId: job.violationId,
        url: job.url,
        selector: job.selector,
        path: screenshotPath,
        ...(skippedReason !== undefined ? { skippedReason } : {}),
      };

      results.push(result);
      options.onScreenshot?.(result, index + 1, jobs.length);
    }

    await context.close();
  } finally {
    await browser?.close();
  }

  return results;
}

/** Format a sequential id: A11Y-001, A11Y-002, … */
export function formatViolationScreenshotId(index: number): string {
  if (!Number.isInteger(index) || index < 1) {
    throw new ScreenshotError(
      `Screenshot index must be a positive integer (received: ${String(index)})`,
      'INVALID_SCREENSHOT_ID',
    );
  }

  return `A11Y-${String(index).padStart(3, '0')}`;
}

interface CaptureOnPageOptions {
  url: string;
  selector: string;
  violationId: string;
  outputPath: string;
  timeoutMs: number;
}

async function captureOnPage(
  page: Page,
  options: CaptureOnPageOptions,
): Promise<string | null> {
  await ensureOnUrl(page, options.url, options.timeoutMs);
  await clearHighlight(page);

  const located = await highlightElement(page, options.selector, options.violationId);
  if (!located) {
    return null;
  }

  // Crop around the highlighted element + A11Y label (not full page).
  const clip = await resolveHighlightClip(page);
  if (!clip) {
    await clearHighlight(page);
    return null;
  }

  await page.screenshot({
    path: options.outputPath,
    clip,
    animations: 'disabled',
  });

  await clearHighlight(page);
  return options.outputPath;
}

const CROP_PADDING_PX = 32;

/**
 * Viewport clip covering the highlighted node and floating violation label.
 */
async function resolveHighlightClip(
  page: Page,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  return page.evaluate(
    ({ styleId, padding }) => {
      const highlighted = document.querySelector(
        '[data-a11y-ops-agent-highlight="true"]',
      ) as HTMLElement | null;
      if (!highlighted) {
        return null;
      }

      const rects: DOMRect[] = [highlighted.getBoundingClientRect()];
      const label =
        (document.getElementById(styleId) as HTMLElement | null) ??
        (document.querySelector('[data-a11y-ops-agent-label="true"]') as HTMLElement | null);
      if (label) {
        rects.push(label.getBoundingClientRect());
      }

      let left = Number.POSITIVE_INFINITY;
      let top = Number.POSITIVE_INFINITY;
      let right = Number.NEGATIVE_INFINITY;
      let bottom = Number.NEGATIVE_INFINITY;

      for (const rect of rects) {
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const x = Math.max(0, Math.floor(left - padding));
      const y = Math.max(0, Math.floor(top - padding));
      const x2 = Math.min(viewportWidth, Math.ceil(right + padding));
      const y2 = Math.min(viewportHeight, Math.ceil(bottom + padding));
      const width = Math.max(1, x2 - x);
      const height = Math.max(1, y2 - y);

      return { x, y, width, height };
    },
    { styleId: HIGHLIGHT_STYLE_ID, padding: CROP_PADDING_PX },
  );
}

async function ensureOnUrl(page: Page, url: string, timeoutMs: number): Promise<void> {
  const current = normalizeUrlForCompare(page.url());
  const target = normalizeUrlForCompare(url);

  if (current === target) {
    return;
  }

  await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });
  await page.waitForLoadState('domcontentloaded');
  await settle(250);
}

/**
 * Apply red outline + floating violation-id label.
 * Returns false when the selector cannot be resolved.
 */
async function highlightElement(
  page: Page,
  selector: string,
  violationId: string,
): Promise<boolean> {
  const candidates = buildSelectorCandidates(selector);

  for (const candidate of candidates) {
    try {
      const locator = page.locator(candidate).first();
      const count = await locator.count();
      if (count === 0) {
        continue;
      }

      await locator.scrollIntoViewIfNeeded().catch(() => undefined);

      const applied = await locator.evaluate(
        (element, labelText) => {
          const target = element as HTMLElement;
          target.setAttribute('data-a11y-ops-agent-highlight', 'true');
          target.style.setProperty('outline', '3px solid #ff0000', 'important');
          target.style.setProperty('outline-offset', '2px', 'important');

          const rect = target.getBoundingClientRect();
          const label = document.createElement('div');
          label.id = 'a11y-ops-agent-violation-highlight';
          label.textContent = labelText;
          label.setAttribute('data-a11y-ops-agent-label', 'true');
          label.style.cssText = [
            'position: absolute',
            `top: ${String(window.scrollY + rect.top - 22)}px`,
            `left: ${String(window.scrollX + rect.left)}px`,
            'background: #ff0000',
            'color: #ffffff',
            'font: 600 12px/1.2 ui-sans-serif, system-ui, sans-serif',
            'padding: 3px 6px',
            'border-radius: 3px',
            'z-index: 2147483647',
            'pointer-events: none',
            'box-shadow: 0 1px 3px rgba(0,0,0,0.35)',
            'white-space: nowrap',
          ].join(';');

          // Keep the label inside the viewport when the element is at the top.
          if (rect.top < 24) {
            label.style.top = `${String(window.scrollY + rect.bottom + 4)}px`;
          }

          document.documentElement.appendChild(label);
          return true;
        },
        violationId,
      );

      if (applied) {
        return true;
      }
    } catch {
      // Try the next candidate selector.
    }
  }

  return false;
}

async function clearHighlight(page: Page): Promise<void> {
  await page
    .evaluate((styleId) => {
      document.querySelectorAll('[data-a11y-ops-agent-highlight="true"]').forEach((node) => {
        const el = node as HTMLElement;
        el.style.removeProperty('outline');
        el.style.removeProperty('outline-offset');
        el.removeAttribute('data-a11y-ops-agent-highlight');
      });

      document.getElementById(styleId)?.remove();
      document.querySelectorAll('[data-a11y-ops-agent-label="true"]').forEach((node) => {
        node.remove();
      });
    }, HIGHLIGHT_STYLE_ID)
    .catch(() => undefined);
}

/**
 * Build locator candidates from an axe selector string.
 * Axe targets may be a single CSS selector or a comma-joined frame path.
 */
function buildSelectorCandidates(selector: string): string[] {
  const trimmed = selector.trim();
  if (!trimmed) {
    return [];
  }

  const candidates = [trimmed];

  // Our scanner joins axe target parts with ", " — try the last segment alone
  // (innermost element) when the full string fails.
  if (trimmed.includes(', ')) {
    const parts = trimmed
      .split(', ')
      .map((part) => part.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== trimmed) {
      candidates.push(last);
    }
  }

  return candidates;
}

function flattenViolations(
  scanResults: PageScanResult[],
): Array<{ url: string; selector: string; violationId: string }> {
  const jobs: Array<{ url: string; selector: string; violationId: string }> = [];
  let index = 1;

  for (const page of scanResults) {
    for (const violation of page.violations) {
      jobs.push({
        url: page.url,
        selector: violation.selector,
        violationId: formatViolationScreenshotId(index),
      });
      index += 1;
    }
  }

  return jobs;
}

function normalizeUrlForCompare(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function settle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { DEFAULT_TIMEOUT_MS };
