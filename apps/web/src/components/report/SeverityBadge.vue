<script setup lang="ts">
import type { ReportSeverity } from '@/lib/report'

defineProps<{
  severity: ReportSeverity
}>()

function classes(severity: ReportSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'bg-red-50 text-red-800'
    case 'Serious':
      return 'bg-orange-50 text-orange-900'
    case 'Moderate':
      return 'bg-amber-50 text-amber-900'
    case 'Minor':
      return 'bg-slate-100 text-slate-700'
  }
}
</script>

<template>
  <span
    class="inline-flex rounded-md px-2 py-0.5 text-xs font-semibold"
    :class="classes(severity)"
  >
    {{ severity }}
  </span>
</template>
