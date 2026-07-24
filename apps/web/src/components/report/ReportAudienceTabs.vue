<script setup lang="ts">
import type { ReportAudience } from '@/lib/report'

defineProps<{
  modelValue: ReportAudience
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReportAudience]
}>()

const tabs: Array<{ id: ReportAudience; label: string; hint: string }> = [
  { id: 'developer', label: 'Developer', hint: 'Code & WCAG' },
  { id: 'qa', label: 'QA', hint: 'Reproduce & verify' },
  { id: 'product', label: 'Product', hint: 'Impact & priorities' },
  { id: 'client', label: 'Client', hint: 'Plain language' },
]

function select(id: ReportAudience) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div
    class="flex flex-wrap gap-2 rounded-2xl border border-line bg-white p-2 shadow-soft"
    role="tablist"
    aria-label="Report audience"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="min-w-[7.5rem] flex-1 rounded-xl px-3 py-2.5 text-left transition"
      :class="
        modelValue === tab.id
          ? 'bg-ink text-white'
          : 'text-ink hover:bg-surface'
      "
      :aria-selected="modelValue === tab.id"
      @click="select(tab.id)"
    >
      <span class="block text-sm font-semibold">{{ tab.label }}</span>
      <span
        class="mt-0.5 block text-xs"
        :class="modelValue === tab.id ? 'text-white/70' : 'text-muted'"
      >
        {{ tab.hint }}
      </span>
    </button>
  </div>
</template>
