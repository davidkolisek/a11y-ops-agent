<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-xl bg-ink text-accent-soft shadow-soft"
    :class="size === 'sm' ? 'size-7' : 'size-8'"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      class="size-[55%]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 8.5C7 6.01472 9.01472 4 11.5 4H12.5C14.9853 4 17 6.01472 17 8.5V9.5C17 11.9853 14.9853 14 12.5 14H11.5C9.01472 14 7 11.9853 7 9.5V8.5Z"
        stroke="currentColor"
        stroke-width="1.6"
      />
      <path
        d="M5 18.5C5.8 15.8 8.2 14 12 14C15.8 14 18.2 15.8 19 18.5"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
      />
    </svg>
  </span>
</template>
