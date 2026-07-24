<script setup lang="ts">
import type { ReportPresentation } from '@/lib/report'

import ProgressBar from '@/components/report/ProgressBar.vue'
import ScoreGauge from '@/components/report/ScoreGauge.vue'
import SeveritySummary from '@/components/report/SeveritySummary.vue'
import UiButton from '@/components/UiButton.vue'

defineProps<{
  presentation: ReportPresentation
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <section class="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          Accessibility report
        </p>
        <h1 class="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {{ presentation.projectSlug }}
        </h1>
        <p class="mt-2 break-all text-muted">{{ presentation.targetUrl }}</p>
        <p class="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          {{ presentation.healthSummary }}
        </p>
      </div>

      <div class="flex items-center gap-4 self-start">
        <ScoreGauge :score="presentation.score" size="lg" />
        <UiButton variant="secondary" type="button" @click="emit('reset')">
          New scan
        </UiButton>
      </div>
    </div>

    <div class="mt-8 grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-line bg-surface px-4 py-4">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          WCAG level
        </p>
        <p class="mt-2 font-display text-xl font-bold text-ink">
          {{ presentation.wcagLevel }}
        </p>
      </div>
      <div class="rounded-xl border border-line bg-surface px-4 py-4">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Estimated fixing time
        </p>
        <p class="mt-2 font-display text-xl font-bold text-ink">
          {{ presentation.estimatedFixTime }}
        </p>
      </div>
      <div class="rounded-xl border border-line bg-surface px-4 py-4">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Total issues
        </p>
        <p class="mt-2 font-display text-xl font-bold text-ink">
          {{ presentation.totalIssues }}
        </p>
      </div>
    </div>

    <div class="mt-6">
      <ProgressBar
        :percent="presentation.progressPercent"
        label="Overall accessibility health"
      />
    </div>

    <div class="mt-8">
      <h2 class="font-display text-lg font-bold text-ink">Issue summary</h2>
      <div class="mt-4">
        <SeveritySummary :severities="presentation.severities" />
      </div>
    </div>

    <p v-if="presentation.aiRan" class="mt-6 text-sm text-muted">
      AI explanations were included for this run.
    </p>
    <p v-else class="mt-6 text-sm text-muted">
      AI analysis was off for this run. Re-scan with “Use AI analysis” enabled to add explanations.
    </p>
  </section>
</template>
