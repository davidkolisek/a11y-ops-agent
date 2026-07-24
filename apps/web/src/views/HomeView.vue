<script setup lang="ts">
import ContentCard from '@/components/ContentCard.vue'
import ScanForm from '@/components/ScanForm.vue'

const steps = [
  {
    eyebrow: '01',
    title: 'Enter URL',
    description:
      'Paste any public website or localhost address. We validate the URL and prepare a focused crawl of your pages.',
  },
  {
    eyebrow: '02',
    title: 'Run Accessibility Scan',
    description:
      'A real browser opens your site, runs WCAG checks with axe-core, and captures highlighted screenshots for each issue.',
  },
  {
    eyebrow: '03',
    title: 'Review Actionable Report',
    description:
      'Get a clear score, prioritized violations, and developer-ready tasks you can copy into Jira, Linear, or GitHub.',
  },
] as const

const benefits = [
  {
    title: 'Developers',
    description:
      'Selectors, screenshots, and concrete fix suggestions cut the time from “found” to “fixed” — without guessing in DevTools.',
  },
  {
    title: 'QA Engineers',
    description:
      'Repeatable WCAG coverage across pages, with severity and evidence you can attach directly to bug reports.',
  },
  {
    title: 'Product Managers',
    description:
      'A single accessibility score and prioritized backlog make risk visible before launch, not after a complaint.',
  },
  {
    title: 'Agencies',
    description:
      'Client-ready HTML reports and Markdown tasks you can hand off — professional output without rebuilding the audit every time.',
  },
] as const

const reportItems = [
  {
    title: 'Accessibility Score',
    description: 'A clear 0–100 score so stakeholders see health at a glance.',
  },
  {
    title: 'WCAG Violations',
    description: 'Rule-level findings mapped to WCAG criteria with help links.',
  },
  {
    title: 'Issue Severity',
    description: 'Critical, high, medium, and low so teams know what to fix first.',
  },
  {
    title: 'Estimated Fix Time',
    description: 'Effort hints that help you plan sprints, not just list problems.',
  },
  {
    title: 'AI Explanations',
    description: 'Plain-language impact and context for each violation when AI is enabled.',
  },
  {
    title: 'Code Suggestions',
    description: 'Practical remediation guidance developers can apply immediately.',
  },
  {
    title: 'Interactive Report',
    description: 'A self-contained HTML dashboard with screenshots and task links.',
  },
] as const
</script>

<template>
  <div>
    <!-- Hero — GTMetrix / PageSpeed style: title + URL first -->
    <section class="border-b border-line bg-white">
      <div class="mx-auto max-w-3xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pb-20 sm:pt-20">
        <h1 class="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Accessibility Scanner
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted sm:text-xl">
          Analyze any website for accessibility issues and get an actionable report —
          WCAG findings, screenshots, severity, and developer-ready tasks.
        </p>

        <div class="mx-auto mt-10 max-w-2xl text-left sm:mt-12">
          <ScanForm size="hero" />
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="bg-surface">
      <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            How it works
          </h2>
          <p class="mt-3 text-lg text-muted">
            Three steps from URL to a report your team can ship against.
          </p>
        </div>

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          <ContentCard
            v-for="step in steps"
            :key="step.title"
            :eyebrow="step.eyebrow"
            :title="step.title"
            :description="step.description"
          />
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section id="benefits" class="border-t border-line bg-white">
      <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            Benefits
          </h2>
          <p class="mt-3 text-lg text-muted">
            Built for the people who find issues — and the people who fix them.
          </p>
        </div>

        <div class="mt-12 grid gap-5 sm:grid-cols-2">
          <ContentCard
            v-for="item in benefits"
            :key="item.title"
            :title="item.title"
            :description="item.description"
          />
        </div>
      </div>
    </section>

    <!-- What the report contains -->
    <section id="report" class="border-t border-line bg-surface">
      <div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
            What the report contains
          </h2>
          <p class="mt-3 text-lg text-muted">
            Everything you need to understand issues and move them into delivery.
          </p>
        </div>

        <ul class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="item in reportItems"
            :key="item.title"
            class="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6"
          >
            <h3 class="font-display text-lg font-bold tracking-tight text-ink">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {{ item.description }}
            </p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
