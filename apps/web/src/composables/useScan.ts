import { storeToRefs } from 'pinia'

import { createScanClient, type ScanClient } from '@/services/scan'
import { useScanStore } from '@/stores/scan'

function normalizeUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a website URL to scan.' }
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'Only http and https URLs are supported.' }
    }
    return { ok: true, url: parsed.toString() }
  } catch {
    return { ok: false, error: 'Enter a valid http(s) URL, e.g. https://example.com' }
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

let activeAbort: AbortController | null = null
let scanClient: ScanClient = createScanClient()

/**
 * Scan business logic — keep UI free of client / abort / validation details.
 *
 * Public API:
 *   useScan() → { startScan, cancelScan, resetScan, ...state }
 *
 * Swap mock → real engine later in `createScanClient()` only.
 */
export function useScan() {
  const store = useScanStore()
  const {
    url,
    status,
    error,
    report,
    progressLog,
    startedAt,
    finishedAt,
    aiEnabled,
    isBusy,
    canSubmit,
    hasReport,
  } = storeToRefs(store)

  async function startScan(rawUrl = store.url): Promise<boolean> {
    const parsed = normalizeUrl(rawUrl)
    if (!parsed.ok) {
      store.setUrl(rawUrl)
      store.setError(parsed.error)
      return false
    }

    cancelScan()
    const controller = new AbortController()
    activeAbort = controller
    store.beginRun(parsed.url)

    try {
      const nextReport = await scanClient.scan({
        url: parsed.url,
        signal: controller.signal,
        cliOverrides: {
          aiMode: store.aiEnabled ? 'on' : 'off',
          maxPages: 10,
        },
        onProgress: (event) => {
          store.appendProgress(event)
        },
      })

      if (controller.signal.aborted) {
        store.cancelRun()
        return false
      }

      store.completeRun(nextReport)
      return true
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) {
        store.cancelRun()
        return false
      }

      const message = err instanceof Error ? err.message : String(err)
      store.failRun(message)
      return false
    } finally {
      if (activeAbort === controller) {
        activeAbort = null
      }
    }
  }

  function cancelScan() {
    if (!activeAbort) {
      return
    }
    activeAbort.abort()
    activeAbort = null
    if (store.status === 'running') {
      store.cancelRun()
    }
  }

  function resetScan() {
    cancelScan()
    store.reset()
  }

  return {
    url,
    status,
    error,
    report,
    progressLog,
    startedAt,
    finishedAt,
    aiEnabled,
    isBusy,
    canSubmit,
    hasReport,
    setUrl: store.setUrl,
    setAiEnabled: store.setAiEnabled,
    startScan,
    cancelScan,
    resetScan,
  }
}
