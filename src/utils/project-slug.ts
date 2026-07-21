/**
 * Derive a filesystem-safe project folder name for per-project report output.
 */

export function slugifyProjectName(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return 'project';
  }

  const withoutWww = trimmed.replace(/^www\./, '');
  const slug = withoutWww
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  return slug || 'project';
}

/**
 * Project id from a target URL hostname (e.g. https://www.example.com/a → example.com).
 */
export function projectSlugFromUrl(url: string): string {
  try {
    return slugifyProjectName(new URL(url).hostname);
  } catch {
    return 'project';
  }
}
