/**
 * Validate and normalize a scan target URL.
 * Throws a user-friendly Error when the value is not a valid http(s) URL.
 */
export function parseTargetUrl(raw: string): string {
  const trimmed = raw.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid URL: "${raw}". Provide an absolute http(s) URL.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(
      `Unsupported protocol "${parsed.protocol}". Only http: and https: are allowed.`,
    );
  }

  return parsed.toString();
}

export function assertNever(value: never, message = 'Unexpected value'): never {
  throw new Error(`${message}: ${String(value)}`);
}
