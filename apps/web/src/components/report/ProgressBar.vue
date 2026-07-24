<script setup lang="ts">
defineProps<{
  percent: number
  label?: string
}>()
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3 text-sm">
      <span class="font-medium text-ink">{{ label ?? 'Accessibility progress' }}</span>
      <span class="font-semibold tabular-nums text-muted">{{ percent }}%</span>
    </div>
    <div
      class="h-2.5 overflow-hidden rounded-full bg-line"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label ?? 'Accessibility progress'"
    >
      <div
        class="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
        :style="{ width: `${Math.max(0, Math.min(100, percent))}%` }"
      />
    </div>
  </div>
</template>
