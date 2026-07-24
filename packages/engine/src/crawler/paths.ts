/**
 * Path include / ignore helpers for the crawler.
 */

/**
 * Returns true when `url` is allowed by include/ignore path rules.
 *
 * - `ignorePaths` always wins (blocked)
 * - when `includePaths` is non-empty, pathname must match at least one entry
 * - patterns match exact pathname or as a directory prefix (`/admin` → `/admin`, `/admin/...`)
 */
export function isPathAllowed(
  url: string,
  options: {
    includePaths?: string[];
    ignorePaths?: string[];
  } = {},
): boolean {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return false;
  }

  const ignorePaths = options.ignorePaths ?? [];
  const includePaths = options.includePaths ?? [];

  if (ignorePaths.some((pattern) => matchesPathPattern(pathname, pattern))) {
    return false;
  }

  if (includePaths.length === 0) {
    return true;
  }

  return includePaths.some((pattern) => matchesPathPattern(pathname, pattern));
}

export function matchesPathPattern(pathname: string, pattern: string): boolean {
  const normalizedPattern = normalizePathPattern(pattern);
  const normalizedPath = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname || '/';

  if (normalizedPattern === '/') {
    return true;
  }

  return (
    normalizedPath === normalizedPattern ||
    normalizedPath.startsWith(`${normalizedPattern}/`)
  );
}

function normalizePathPattern(pattern: string): string {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return '/';
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}
