<script setup lang="ts">
import { ref } from 'vue'

import type { EnrichedIssue } from '@/lib/report'
import { formatJiraTaskMarkdown } from '@/lib/report/jiraTask'
import UiButton from '@/components/UiButton.vue'

const props = defineProps<{
  issue: EnrichedIssue
}>()

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  const markdown = formatJiraTaskMarkdown(props.issue)
  try {
    await navigator.clipboard.writeText(markdown)
    copied.value = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <UiButton variant="secondary" size="sm" type="button" @click="copy">
    {{ copied ? 'Copied' : 'Copy as Jira task' }}
  </UiButton>
</template>
