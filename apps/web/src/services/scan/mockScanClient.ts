import type { ScanProgressEvent } from '@a11y-agent-ops/shared'

import { createMockAccessibilityReport } from './mockReport'
import type { ScanClient } from './types'

function buildProgressSteps(enableAi: boolean): ScanProgressEvent[] {
  const steps: ScanProgressEvent[] = [
    { type: 'message', message: 'Starting accessibility audit...' },
    { type: 'blank' },
    { type: 'ok', message: 'Crawling pages' },
    { type: 'ok', message: 'Found 8 pages' },
    { type: 'blank' },
    { type: 'ok', message: 'Running accessibility checks' },
    { type: 'blank' },
    { type: 'message', message: 'Issues found:' },
    { type: 'message', message: '5' },
    { type: 'blank' },
    { type: 'ok', message: 'Generating screenshots' },
  ]

  if (enableAi) {
    steps.push({ type: 'ok', message: 'AI analysis completed' })
  } else {
    steps.push({ type: 'skip', message: 'AI analysis skipped' })
  }

  steps.push(
    { type: 'ok', message: 'Tasks generated' },
    { type: 'ok', message: 'Report created' },
  )

  return steps
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Scan cancelled', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Scan cancelled', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Mock ScanClient — same contract as a future engine/API client.
 * Simulates crawl → axe → screenshots → optional AI → report.
 */
export function createMockScanClient(options?: {
  stepDelayMs?: number
}): ScanClient {
  const stepDelayMs = options?.stepDelayMs ?? 280

  return {
    async scan({ url, onProgress, signal, cliOverrides }) {
      const enableAi =
        cliOverrides?.aiMode === 'on' || cliOverrides?.aiMode === 'auto'

      for (const event of buildProgressSteps(enableAi)) {
        await delay(stepDelayMs, signal)
        onProgress?.(event)
      }

      await delay(stepDelayMs, signal)
      return createMockAccessibilityReport(url, { enableAi })
    },
  }
}
