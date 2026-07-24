<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: number
  size?: 'md' | 'lg'
}>()

const radius = 54
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
  const clamped = Math.max(0, Math.min(100, props.score))
  return circumference * (1 - clamped / 100)
})

const toneClass = computed(() => {
  if (props.score >= 90) return 'text-accent'
  if (props.score >= 75) return 'text-accent-strong'
  if (props.score >= 60) return 'text-amber-700'
  return 'text-red-700'
})

const isLarge = computed(() => props.size !== 'md')
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center"
    :class="isLarge ? 'size-36 sm:size-40' : 'size-28'"
    role="img"
    :aria-label="`Accessibility score ${score} out of 100`"
  >
    <svg class="size-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        class="stroke-line"
        stroke-width="10"
      />
      <circle
        cx="60"
        cy="60"
        :r="radius"
        fill="none"
        class="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span
        class="font-display font-extrabold tracking-tight"
        :class="[toneClass, isLarge ? 'text-4xl sm:text-5xl' : 'text-3xl']"
      >
        {{ score }}
      </span>
      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Score
      </span>
    </div>
  </div>
</template>
