<script setup lang="ts">
import { RouterLink } from 'vue-router'

import BrandMark from '@/components/BrandMark.vue'
</script>

<template>
  <header class="border-b border-line bg-white">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
      <RouterLink to="/" class="inline-flex items-center gap-2.5">
        <BrandMark />
        <span class="font-display text-lg font-bold tracking-tight text-ink">
          A11yOps
        </span>
      </RouterLink>

      <nav
        class="hidden items-center gap-7 text-sm font-medium text-muted md:flex"
        aria-label="Primary"
      >
        <a href="#how-it-works" class="transition-colors hover:text-ink">How it works</a>
        <a href="#benefits" class="transition-colors hover:text-ink">Benefits</a>
        <a href="#report" class="transition-colors hover:text-ink">Report</a>
        <RouterLink to="/scan" class="transition-colors hover:text-ink">Scan</RouterLink>
      </nav>
    </div>
  </header>
</template>
