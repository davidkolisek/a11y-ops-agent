<script setup lang="ts">
import type { EnrichedIssue } from '@/lib/report'

import CodeBlock from '@/components/report/CodeBlock.vue'
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
        Developer view
      </h2>
      <p class="mt-2 text-muted">
        Selectors, highlighted crops, HTML, WCAG, suggested fixes — and AI when enabled.
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
          <span class="text-xs font-medium text-muted">{{ issue.estimatedEffort }}</span>
        </div>
        <CopyJiraTaskButton :issue="issue" />
      </div>

      <h3 class="mt-3 font-display text-xl font-bold text-ink">{{ issue.title }}</h3>

      <div v-if="issue.screenshotCropSrc" class="mt-5">
        <IssueScreenshot
          :src="issue.screenshotCropSrc"
          :violation-id="issue.id"
          :alt="`Highlighted crop for ${issue.title}`"
        />
      </div>

      <dl class="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt class="font-semibold text-ink">Selector</dt>
          <dd class="mt-1 font-mono text-muted">{{ issue.selector }}</dd>
        </div>
        <div>
          <dt class="font-semibold text-ink">Page</dt>
          <dd class="mt-1 break-all text-muted">{{ issue.pageUrl }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="font-semibold text-ink">WCAG reference</dt>
          <dd class="mt-1 text-muted">
            {{ issue.wcagReference }}
            <a
              v-if="issue.helpUrl"
              :href="issue.helpUrl"
              class="ml-2 text-accent underline-offset-2 hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              Docs
            </a>
          </dd>
        </div>
      </dl>

      <div class="mt-5 space-y-4">
        <CodeBlock :code="issue.htmlSnippet" label="HTML snippet" />
        <CodeBlock :code="issue.suggestedCodeFix" label="Suggested code fix" />
      </div>

      <div
        v-if="issue.hasAi && issue.aiExplanation"
        class="mt-5 rounded-xl border border-line bg-surface p-4"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          AI explanation
        </p>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          {{ issue.aiExplanation }}
        </p>
      </div>
    </article>
  </div>
</template>
