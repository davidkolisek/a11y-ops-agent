<script setup lang="ts">
import type { ReportSeverityCount } from '@/lib/report'

defineProps<{
  severities: ReportSeverityCount[]
}>()

function tone(key: string): string {
  switch (key) {
    case 'Critical':
      return 'border-red-200 bg-red-50 text-red-800'
    case 'Serious':
      return 'border-orange-200 bg-orange-50 text-orange-900'
    case 'Moderate':
      return 'border-amber-200 bg-amber-50 text-amber-900'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div
      v-for="item in severities"
      :key="item.key"
      class="rounded-xl border px-4 py-3"
      :class="tone(item.key)"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
        {{ item.label }}
      </p>
      <p class="mt-1 font-display text-2xl font-bold tabular-nums">
        {{ item.count }}
      </p>
    </div>
  </div>
</template>
