import type { AccessibilityReport, AiMode, Locale, WcagLevel } from '@a11y-agent-ops/shared'

const SCAN_ENDPOINT = '/.netlify/functions/scan'

export interface ScanWebsiteOptions {
  signal?: AbortSignal
  maxPages?: number
  aiMode?: AiMode
  wcagLevel?: WcagLevel
  locale?: Locale
  projectName?: string
}

type ScanApiSuccess = { success: true; data: AccessibilityReport }
type ScanApiFailure = { success: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseEnvelope(value: unknown): ScanApiSuccess | ScanApiFailure {
  if (!isRecord(value) || typeof value.success !== 'boolean') {
    throw new Error('Unexpected scan response')
  }
  if (value.success === true) {
    return { success: true, data: value.data as AccessibilityReport }
  }
  return {
    success: false,
    error: typeof value.error === 'string' ? value.error : 'Scan failed',
  }
}

/**
 * Host-agnostic scan API for the web app.
 * UI / composables should call this — not Netlify URLs directly.
 */
export async function scanWebsite(
  url: string,
  options: ScanWebsiteOptions = {},
): Promise<AccessibilityReport> {
  const response = await fetch(SCAN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    signal: options.signal,
    body: JSON.stringify({
      url,
      cliOverrides: {
        ...(options.maxPages !== undefined ? { maxPages: options.maxPages } : {}),
        ...(options.aiMode !== undefined ? { aiMode: options.aiMode } : {}),
        ...(options.wcagLevel !== undefined ? { wcagLevel: options.wcagLevel } : {}),
        ...(options.locale !== undefined ? { locale: options.locale } : {}),
        ...(options.projectName !== undefined ? { projectName: options.projectName } : {}),
      },
    }),
  })

  let envelope: ScanApiSuccess | ScanApiFailure
  try {
    envelope = parseEnvelope(await response.json())
  } catch {
    throw new Error(`Scan request failed (${response.status})`)
  }

  if (!envelope.success) {
    throw new Error(envelope.error)
  }

  return envelope.data
}
