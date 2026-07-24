<script setup lang="ts">
defineProps<{
  src: string
  violationId: string
  alt?: string
}>()
</script>

<template>
  <figure class="overflow-hidden rounded-xl border border-line bg-surface">
    <figcaption class="border-b border-line px-3 py-2 text-xs font-semibold text-muted">
      Highlighted crop · {{ violationId }}
    </figcaption>
    <img
      :src="src"
      :alt="alt ?? `Highlighted element for ${violationId}`"
      class="max-h-80 w-full object-contain object-left bg-[#f3f5f9]"
      loading="lazy"
    />
  </figure>
</template>
