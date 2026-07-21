import { chromium, type Browser, type Page } from 'playwright';

import { isPathAllowed } from './paths.js';
import {
  CrawlError,
  type CrawledPage,
  type CrawlOptions,
  type CrawlResult,
} from './types.js';

const DEFAULT_MAX_PAGES = 50;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Crawl a site starting from `startUrl`, collecting internal pages only.
 *
 * Supports JS-rendered / SPA apps by waiting for `networkidle` after navigation
 * and extracting links from the fully rendered DOM.
 */
export async function crawlSite(options: CrawlOptions): Promise<CrawlResult> {
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const includePaths = options.includePaths ?? [];
  const ignorePaths = options.ignorePaths ?? [];

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new CrawlError(
      `--max-pages must be a positive integer (received: ${String(options.maxPages)})`,
      'INVALID_MAX_PAGES',
    );
  }

  let startOrigin: URL;
  try {
    startOrigin = new URL(options.startUrl);
  } catch (cause) {
    throw new CrawlError(
      `Invalid start URL: "${options.startUrl}"`,
      'INVALID_START_URL',
      cause,
    );
  }

  if (startOrigin.protocol !== 'http:' && startOrigin.protocol !== 'https:') {
    throw new CrawlError(
      `Unsupported protocol "${startOrigin.protocol}". Only http: and https: are allowed.`,
      'INVALID_START_URL',
    );
  }

  const startUrl = canonicalizeUrl(startOrigin);
  const visited = new Set<string>();
  const enqueued = new Set<string>([startUrl]);
  const queue: string[] = [startUrl];
  const pages: CrawledPage[] = [];
  const failedUrls: string[] = [];

  let browser: Browser | undefined;

  try {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (cause) {
      throw new CrawlError(
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

    while (queue.length > 0 && pages.length < maxPages) {
      const currentUrl = queue.shift();
      if (!currentUrl) {
        break;
      }

      if (visited.has(currentUrl)) {
        continue;
      }
      visited.add(currentUrl);

      // Start URL is always visited; discovered URLs respect include/ignore filters.
      const isStart = currentUrl === startUrl;
      if (
        !isStart &&
        !isPathAllowed(currentUrl, { includePaths, ignorePaths })
      ) {
        continue;
      }

      try {
        const crawled = await crawlSinglePage(page, currentUrl, startOrigin, timeoutMs);

        // Drop non-start pages that redirected into an ignored/excluded path.
        if (
          !isStart &&
          !isPathAllowed(crawled.url, { includePaths, ignorePaths })
        ) {
          continue;
        }

        pages.push(crawled);
        options.onPageCrawled?.(crawled, pages.length);

        if (pages.length >= maxPages) {
          break;
        }

        for (const link of await extractInternalLinks(page, startOrigin)) {
          if (
            !visited.has(link) &&
            !enqueued.has(link) &&
            isPathAllowed(link, { includePaths, ignorePaths })
          ) {
            enqueued.add(link);
            queue.push(link);
          }
        }
      } catch (error) {
        failedUrls.push(currentUrl);
        const normalized =
          error instanceof Error ? error : new Error(String(error));
        options.onPageError?.(currentUrl, normalized);
      }
    }

    await context.close();
  } finally {
    await browser?.close();
  }

  return {
    startUrl,
    pages,
    failedUrls,
  };
}

async function crawlSinglePage(
  page: Page,
  url: string,
  startOrigin: URL,
  timeoutMs: number,
): Promise<CrawledPage> {
  const response = await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: timeoutMs,
  });

  // Extra settle time helps SPA routers finish client-side rendering.
  await page.waitForLoadState('domcontentloaded');
  await settle(250);

  const finalUrl = canonicalizeUrl(new URL(page.url()));

  if (!isSameOrigin(startOrigin, new URL(finalUrl))) {
    throw new CrawlError(
      `Navigation left the origin (${startOrigin.origin} → ${finalUrl})`,
      'EXTERNAL_REDIRECT',
    );
  }

  if (response !== null && response.status() >= 400) {
    throw new CrawlError(
      `HTTP ${String(response.status())} for ${url}`,
      'HTTP_ERROR',
    );
  }

  const [title, html] = await Promise.all([page.title(), page.content()]);

  return {
    url: finalUrl,
    title: title.trim(),
    html,
  };
}

/**
 * Collect unique same-origin http(s) links from the rendered DOM.
 */
async function extractInternalLinks(page: Page, startOrigin: URL): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', (anchors) =>
    anchors
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href): href is string => href !== null && href.trim().length > 0),
  );

  const discovered = new Set<string>();

  for (const href of hrefs) {
    const absolute = resolveInternalUrl(href, page.url(), startOrigin);
    if (absolute) {
      discovered.add(absolute);
    }
  }

  return [...discovered];
}

function resolveInternalUrl(
  href: string,
  baseUrl: string,
  startOrigin: URL,
): string | null {
  const trimmed = href.trim();

  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return null;
  }

  let absolute: URL;
  try {
    absolute = new URL(trimmed, baseUrl);
  } catch {
    return null;
  }

  if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') {
    return null;
  }

  if (!isSameOrigin(startOrigin, absolute)) {
    return null;
  }

  return canonicalizeUrl(absolute);
}

function isSameOrigin(origin: URL, candidate: URL): boolean {
  return (
    origin.protocol === candidate.protocol &&
    origin.hostname === candidate.hostname &&
    origin.port === candidate.port
  );
}

/**
 * Stable URL key for deduplication:
 * - drops hash fragments (in-page anchors / most hash routers share one document)
 * - removes default ports
 * - strips a trailing slash except for the origin root
 */
export function canonicalizeUrl(input: string | URL): string {
  const url = typeof input === 'string' ? new URL(input) : new URL(input.toString());

  url.hash = '';

  if (
    (url.protocol === 'http:' && url.port === '80') ||
    (url.protocol === 'https:' && url.port === '443')
  ) {
    url.port = '';
  }

  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  url.pathname = pathname || '/';

  return url.toString();
}

function settle(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { DEFAULT_MAX_PAGES, DEFAULT_TIMEOUT_MS };
