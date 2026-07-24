<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ReportPage from '@/components/report/ReportPage.vue'
import ScanForm from '@/components/ScanForm.vue'
import ScanLoadingState from '@/components/scan/ScanLoadingState.vue'
import UiButton from '@/components/UiButton.vue'
import { useScan } from '@/composables/useScan'

const route = useRoute()
const router = useRouter()

const {
  url,
  status,
  error,
  report,
  progressLog,
  isBusy,
  setUrl,
  startScan,
  cancelScan,
  resetScan,
} = useScan()

const shellClass = computed(() =>
  status.value === 'completed' && report.value
    ? 'mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14'
    : 'mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16',
)

async function syncFromQueryAndMaybeStart() {
  const queryUrl = route.query.url
  if (typeof queryUrl === 'string' && queryUrl.trim()) {
    setUrl(queryUrl)
  }

  if (typeof queryUrl === 'string' && queryUrl.trim() && !isBusy.value) {
    await startScan(queryUrl)
  }
}

onMounted(() => {
  void syncFromQueryAndMaybeStart()
})

watch(
  () => route.query.url,
  (next, prev) => {
    if (next !== prev) {
      void syncFromQueryAndMaybeStart()
    }
  },
)

function onReset() {
  resetScan()
  void router.replace({ name: 'scan' })
}

function onCancel() {
  cancelScan()
}
</script>

<template>
  <div class="bg-surface">
    <div :class="shellClass">
      <template v-if="status === 'running'">
        <ScanLoadingState
          :target-url="url"
          :progress-log="progressLog"
          @cancel="onCancel"
        />
      </template>

      <template v-else-if="status === 'completed' && report">
        <ReportPage :report="report" @reset="onReset" />
      </template>

      <template v-else>
        <h1 class="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Run an accessibility scan
        </h1>
        <p class="mt-3 max-w-xl text-lg text-muted">
          Enter a URL to simulate a full audit with a mocked accessibility report.
        </p>

        <div class="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-8">
          <ScanForm :navigate-on-submit="false" :hint="false" />

          <div
            v-if="status === 'failed' || status === 'cancelled'"
            class="mt-6 border-t border-line pt-5"
            role="alert"
          >
            <p class="font-display text-lg font-bold text-ink">
              {{ status === 'cancelled' ? 'Scan cancelled' : 'Scan failed' }}
            </p>
            <p v-if="error" class="mt-2 text-sm text-red-700">{{ error }}</p>
            <div class="mt-4">
              <UiButton variant="secondary" type="button" @click="resetScan">
                Try again
              </UiButton>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
