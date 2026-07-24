/**
 * Crawler domain types.
 */

export interface CrawledPage {
  url: string;
  title: string;
  html: string;
}

export interface CrawlOptions {
  /** Absolute http(s) URL to start from */
  startUrl: string;
  /** Maximum number of pages to visit (default: 50) */
  maxPages?: number;
  /** Navigation / network-idle timeout in milliseconds (default: 30_000) */
  timeoutMs?: number;
  /** Only crawl pathnames matching these prefixes (empty = all) */
  includePaths?: string[];
  /** Skip pathnames matching these prefixes */
  ignorePaths?: string[];
  /** Optional callback for crawl progress */
  onPageCrawled?: (page: CrawledPage, index: number) => void;
  /** Optional callback when a single page fails (crawl continues) */
  onPageError?: (url: string, error: Error) => void;
}

export interface CrawlResult {
  startUrl: string;
  pages: CrawledPage[];
  /** URLs that failed to load or parse */
  failedUrls: string[];
}
