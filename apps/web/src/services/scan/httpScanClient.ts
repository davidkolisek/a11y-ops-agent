import { scanWebsite } from '@/api/scan'

import type { ScanClient } from './types'

/**
 * ScanClient backed by the app HTTP API (`scanWebsite`).
 * Progress is approximated — the endpoint returns a single JSON result.
 */
export function createHttpScanClient(): ScanClient {
  return {
    async scan({ url, onProgress, signal, cliOverrides }) {
      onProgress?.({ type: 'message', message: 'Starting accessibility audit...' })
      onProgress?.({ type: 'blank' })
      onProgress?.({ type: 'ok', message: 'Running accessibility scan' })

      const report = await scanWebsite(url, {
        signal,
        maxPages: cliOverrides?.maxPages,
        aiMode: cliOverrides?.aiMode,
        wcagLevel: cliOverrides?.wcagLevel,
        locale: cliOverrides?.locale,
        projectName: cliOverrides?.projectName,
      })

      if (report.aiRan) {
        onProgress?.({ type: 'ok', message: 'AI analysis completed' })
      } else {
        onProgress?.({ type: 'skip', message: 'AI analysis skipped' })
      }
      onProgress?.({ type: 'ok', message: 'Report created' })

      return report
    },
  }
}
