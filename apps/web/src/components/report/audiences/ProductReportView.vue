<script setup lang="ts">
import type { ReportPresentation } from '@/lib/report'

import CopyJiraTaskButton from '@/components/report/CopyJiraTaskButton.vue'
import IssueScreenshot from '@/components/report/IssueScreenshot.vue'
import SeverityBadge from '@/components/report/SeverityBadge.vue'

defineProps<{
  presentation: ReportPresentation
}>()
</script>

<template>
  <div class="space-y-5">
    <header>
      <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
        Product view
      </h2>
      <p class="mt-2 text-muted">
        Health, business impact, effort, and recommended priorities for planning.
      </p>
    </header>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-line bg-white p-5 shadow-soft md:col-span-1">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Overall accessibility health
        </p>
        <p class="mt-3 font-display text-3xl font-bold text-ink">
          {{ presentation.healthLabel }}
        </p>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          {{ presentation.healthSummary }}
        </p>
        <p class="mt-4 text-sm text-ink">
          Score <span class="font-bold">{{ presentation.score }}</span>
          · {{ presentation.wcagLevel }}
        </p>
      </div>

      <div class="rounded-2xl border border-line bg-white p-5 shadow-soft md:col-span-2">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Business impact
        </p>
        <p class="mt-3 text-base leading-relaxed text-ink-soft">
          {{ presentation.businessImpact }}
        </p>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-surface px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Estimated effort
            </p>
            <p class="mt-1 font-display text-xl font-bold text-ink">
              {{ presentation.estimatedFixTime }}
            </p>
          </div>
          <div class="rounded-xl bg-surface px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Open issues
            </p>
            <p class="mt-1 font-display text-xl font-bold text-ink">
              {{ presentation.totalIssues }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
      <h3 class="font-display text-lg font-bold text-ink">Recommended priorities</h3>
      <ol class="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
        <li v-for="(item, index) in presentation.recommendedPriorities" :key="index">
          {{ item }}
        </li>
      </ol>
    </section>

    <section class="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
      <h3 class="font-display text-lg font-bold text-ink">Priority backlog</h3>
      <ul class="mt-4 space-y-5">
        <li
          v-for="issue in presentation.issues"
          :key="issue.id"
          class="border-b border-line pb-5 last:border-b-0 last:pb-0"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <SeverityBadge :severity="issue.severity" />
                <span class="font-mono text-xs text-muted">{{ issue.id }}</span>
                <span class="text-sm font-medium text-muted">{{ issue.estimatedEffort }}</span>
              </div>
              <p class="mt-1 font-semibold text-ink">{{ issue.title }}</p>
            </div>
            <CopyJiraTaskButton :issue="issue" />
          </div>
          <div v-if="issue.screenshotCropSrc" class="mt-4 max-w-md">
            <IssueScreenshot
              :src="issue.screenshotCropSrc"
              :violation-id="issue.id"
            />
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>
