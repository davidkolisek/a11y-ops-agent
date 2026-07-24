<script setup lang="ts">
import type { ReportPresentation } from '@/lib/report'

defineProps<{
  presentation: ReportPresentation
}>()
</script>

<template>
  <div class="space-y-5">
    <header>
      <h2 class="font-display text-2xl font-bold tracking-tight text-ink">
        Client view
      </h2>
      <p class="mt-2 max-w-2xl text-muted">
        A plain-language summary — what we found, why it matters, and how improvements help your customers.
      </p>
    </header>

    <section class="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        Why accessibility matters
      </p>
      <p class="mt-3 text-lg leading-relaxed text-ink-soft">
        {{ presentation.clientIntro }}
      </p>
      <p class="mt-4 text-base leading-relaxed text-muted">
        Right now your site scores
        <span class="font-semibold text-ink">{{ presentation.score }} / 100</span>
        against {{ presentation.wcagLevel }}. That means most visitors can use it, but
        {{ presentation.totalIssues }}
        improvement{{ presentation.totalIssues === 1 ? '' : 's' }} would make key journeys safer and clearer.
      </p>
    </section>

    <section class="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h3 class="font-display text-xl font-bold text-ink">
        What we recommend improving
      </h3>
      <ul class="mt-5 space-y-4">
        <li
          v-for="issue in presentation.issues"
          :key="issue.id"
          class="rounded-xl border border-line bg-surface p-4 sm:p-5"
        >
          <p class="font-display text-lg font-bold text-ink">
            {{ issue.plainTitle }}
          </p>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            <span class="font-semibold text-ink">Why it matters:</span>
            {{ issue.plainWhyItMatters }}
          </p>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            <span class="font-semibold text-ink">Recommended improvement:</span>
            {{ issue.plainImprovement }}
          </p>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            <span class="font-semibold text-ink">Expected benefit:</span>
            {{ issue.plainBenefit }}
          </p>
        </li>
      </ul>
    </section>

    <section class="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
      <h3 class="font-display text-xl font-bold text-ink">
        Expected benefits
      </h3>
      <ul class="mt-4 space-y-3">
        <li
          v-for="(benefit, index) in presentation.clientBenefits"
          :key="index"
          class="flex gap-3 text-base leading-relaxed text-ink-soft"
        >
          <span class="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span>{{ benefit }}</span>
        </li>
      </ul>
      <p class="mt-6 text-sm text-muted">
        Estimated team effort to address these findings:
        <span class="font-semibold text-ink">{{ presentation.estimatedFixTime }}</span>.
      </p>
    </section>
  </div>
</template>
