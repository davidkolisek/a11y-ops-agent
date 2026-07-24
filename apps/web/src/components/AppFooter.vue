<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="border-t border-line bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-8"
    >
      <p>
        <RouterLink to="/" class="font-medium text-ink hover:underline">A11yOps</RouterLink>
        · Accessibility Scanner
      </p>
      <p>
        <a
          class="transition-colors hover:text-ink"
          href="https://github.com/davidkolisek/a11y-agent-ops"
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
        <span class="mx-2 text-line">·</span>
        <span>© {{ new Date().getFullYear() }}</span>
      </p>
    </div>
  </footer>
</template>
