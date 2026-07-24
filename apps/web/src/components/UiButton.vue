<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    type?: 'button' | 'submit'
    to?: string
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    block: false,
  },
)

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50'

  const sizes = {
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-7 text-base sm:h-16 sm:px-8 sm:text-lg',
  } as const

  const variants = {
    primary:
      'bg-ink text-white shadow-soft hover:bg-ink-soft active:translate-y-px',
    secondary:
      'bg-surface-elevated text-ink shadow-soft ring-1 ring-line hover:bg-white active:translate-y-px',
    ghost: 'bg-transparent text-ink hover:bg-line/50',
  } as const

  return [
    base,
    sizes[props.size],
    variants[props.variant],
    props.block ? 'w-full' : '',
  ]
})
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button v-else :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
