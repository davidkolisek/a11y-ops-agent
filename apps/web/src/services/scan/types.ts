import type {
  AccessibilityReport,
  ScanOptions,
  ScanProgressEvent,
} from '@a11y-agent-ops/shared'

/**
 * Host-agnostic scan client.
 * Today: mock. Later: thin wrapper around `@a11y-agent-ops/engine` or an HTTP API.
 * Keep the same signature so UI / composables stay unchanged.
 */
export interface ScanClient {
  scan(
    options: ScanOptions & {
      /** Abort in-flight work (cancel button / navigation away) */
      signal?: AbortSignal
    },
  ): Promise<AccessibilityReport>
}

export type { AccessibilityReport, ScanOptions, ScanProgressEvent }
