<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    eyebrow?: string
  }>(),
  {
    eyebrow: undefined,
  },
)
</script>

<template>
  <article
    class="flex h-full flex-col rounded-2xl border border-line bg-surface-elevated p-6 shadow-soft sm:p-7"
  >
    <p
      v-if="eyebrow"
      class="text-xs font-semibold uppercase tracking-[0.14em] text-accent"
    >
      {{ eyebrow }}
    </p>
    <h3
      class="font-display text-xl font-bold tracking-tight text-ink"
      :class="eyebrow ? 'mt-3' : ''"
    >
      {{ title }}
    </h3>
    <p class="mt-3 flex-1 text-base leading-relaxed text-muted">
      {{ description }}
    </p>
  </article>
</template>
