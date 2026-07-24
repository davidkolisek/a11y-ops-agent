<script setup lang="ts">
import UiButton from '@/components/UiButton.vue'

defineProps<{
  targetUrl: string
  progressLog: string[]
}>()

const emit = defineEmits<{
  cancel: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8" aria-live="polite">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.12em] text-accent">
          Scanning
        </p>
        <h2 class="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
          Analyzing your website
        </h2>
        <p class="mt-2 break-all text-muted">{{ targetUrl }}</p>
      </div>
      <UiButton variant="secondary" size="sm" type="button" @click="emit('cancel')">
        Cancel
      </UiButton>
    </div>

    <div class="mt-6 flex items-center gap-3" role="status">
      <span
        class="size-5 animate-spin rounded-full border-2 border-line border-t-accent"
        aria-hidden="true"
      />
      <span class="text-sm font-medium text-ink">Running accessibility checks…</span>
    </div>

    <ol v-if="progressLog.length" class="mt-6 space-y-2 border-t border-line pt-5">
      <li
        v-for="(line, index) in progressLog"
        :key="`${index}-${line}`"
        class="font-mono text-sm text-muted"
      >
        {{ line }}
      </li>
    </ol>
  </div>
</template>
