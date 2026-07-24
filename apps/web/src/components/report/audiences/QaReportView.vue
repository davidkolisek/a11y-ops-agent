<script setup lang="ts">
import type { EnrichedIssue } from '@/lib/report'

import CopyJiraTaskButton from '@/components/report/CopyJiraTaskButton.vue'
import IssueScreenshot from '@/components/report/IssueScreenshot.vue'
import SeverityBadge from '@/components/report/SeverityBadge.vue'

defineProps<{
  issues: EnrichedIssue[]
}>()
</script>

<template>
  <div class="space-y-4">
    <header class="mb-2">
      <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
        QA view
      </h2>
      <p class="mt-2 text-muted">
        Severity, highlighted crops, reproduction steps, expected behavior, and verification.
      </p>
    </header>

    <article
      v-for="issue in issues"
      :key="issue.id"
      class="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs font-semibold text-muted">{{ issue.id }}</span>
          <SeverityBadge :severity="issue.severity" />
        </div>
        <CopyJiraTaskButton :issue="issue" />
      </div>

      <h3 class="mt-3 font-display text-xl font-bold text-ink">{{ issue.title }}</h3>
      <p class="mt-2 text-sm text-muted">{{ issue.pageUrl }}</p>

      <div v-if="issue.screenshotCropSrc" class="mt-5">
        <IssueScreenshot
          :src="issue.screenshotCropSrc"
          :violation-id="issue.id"
        />
      </div>

      <div class="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <h4 class="text-sm font-semibold text-ink">Reproduction</h4>
          <ol class="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            <li v-for="(step, index) in issue.reproduction" :key="index">
              {{ step }}
            </li>
          </ol>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-ink">Expected behavior</h4>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ issue.expectedBehavior }}
          </p>
        </div>
      </div>

      <div class="mt-5 rounded-xl border border-line bg-surface p-4">
        <h4 class="text-sm font-semibold text-ink">Verification checklist</h4>
        <ul class="mt-3 space-y-2">
          <li
            v-for="(item, index) in issue.verificationChecklist"
            :key="index"
            class="flex gap-3 text-sm text-muted"
          >
            <span
              class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-line bg-white"
              aria-hidden="true"
            />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </article>
  </div>
</template>
