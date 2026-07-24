<script setup lang="ts">
withDefaults(
  defineProps<{
    code: string
    label?: string
  }>(),
  {
    label: 'Code',
  },
)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line bg-ink">
    <div class="border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
      {{ label }}
    </div>
    <pre class="overflow-x-auto p-4 text-sm leading-relaxed text-accent-soft"><code>{{ code }}</code></pre>
  </div>
</template>
