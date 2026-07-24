import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { AccessibilityReport, ScanProgressEvent } from '@/services/scan'

export type ScanStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * Shared scan session state (survives route changes).
 * Mutations go through `useScan()` — keep this store data-only.
 */
export const useScanStore = defineStore('scan', () => {
  const url = ref('')
  const status = ref<ScanStatus>('idle')
  const error = ref<string | null>(null)
  const report = ref<AccessibilityReport | null>(null)
  const progressLog = ref<string[]>([])
  const startedAt = ref<string | null>(null)
  const finishedAt = ref<string | null>(null)
  /** AI is opt-in for web scans (default off). */
  const aiEnabled = ref(false)

  const isBusy = computed(() => status.value === 'running')
  const canSubmit = computed(() => url.value.trim().length > 0 && !isBusy.value)
  const hasReport = computed(() => report.value !== null && status.value === 'completed')

  function setUrl(value: string) {
    url.value = value
    if (error.value) {
      error.value = null
    }
  }

  function setAiEnabled(value: boolean) {
    aiEnabled.value = value
  }

  function setError(message: string | null) {
    error.value = message
  }

  function appendProgress(event: ScanProgressEvent) {
    if (event.type === 'blank') {
      return
    }
    if (event.type === 'ok') {
      progressLog.value.push(`✓ ${event.message}`)
      return
    }
    if (event.type === 'skip') {
      progressLog.value.push(`○ ${event.message}`)
      return
    }
    progressLog.value.push(event.message)
  }

  function beginRun(targetUrl: string) {
    url.value = targetUrl
    status.value = 'running'
    error.value = null
    report.value = null
    progressLog.value = []
    startedAt.value = new Date().toISOString()
    finishedAt.value = null
  }

  function completeRun(next: AccessibilityReport) {
    report.value = next
    status.value = 'completed'
    finishedAt.value = new Date().toISOString()
  }

  function failRun(message: string) {
    error.value = message
    status.value = 'failed'
    finishedAt.value = new Date().toISOString()
  }

  function cancelRun() {
    status.value = 'cancelled'
    error.value = 'Scan cancelled'
    finishedAt.value = new Date().toISOString()
  }

  function reset() {
    status.value = 'idle'
    error.value = null
    report.value = null
    progressLog.value = []
    startedAt.value = null
    finishedAt.value = null
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
    setUrl,
    setAiEnabled,
    setError,
    appendProgress,
    beginRun,
    completeRun,
    failRun,
    cancelRun,
    reset,
  }
})
