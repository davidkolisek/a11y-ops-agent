<script setup lang="ts">
import { computed, useId } from 'vue'
import { useRouter } from 'vue-router'

import UiButton from '@/components/UiButton.vue'
import UiInput from '@/components/UiInput.vue'
import { useScan } from '@/composables/useScan'

const props = withDefaults(
  defineProps<{
    size?: 'md' | 'hero'
    navigateOnSubmit?: boolean
    hint?: boolean
  }>(),
  {
    size: 'md',
    navigateOnSubmit: true,
    hint: true,
  },
)

const router = useRouter()
const {
  url,
  error,
  isBusy,
  canSubmit,
  aiEnabled,
  setUrl,
  setAiEnabled,
  startScan,
  resetScan,
} = useScan()

const isHero = computed(() => props.size === 'hero')
const buttonSize = computed(() => (isHero.value ? 'xl' : 'lg'))
const aiToggleId = useId()

async function onSubmit() {
  if (props.navigateOnSubmit) {
    const parsed = url.value.trim()
    resetScan()
    await router.push({ name: 'scan', query: parsed ? { url: parsed } : {} })
    return
  }

  await startScan()
}
</script>

<template>
  <form class="w-full" @submit.prevent="onSubmit">
    <div
      class="flex w-full flex-col gap-3 sm:flex-row"
      :class="isHero ? 'sm:items-stretch sm:gap-3' : 'sm:items-start'"
    >
      <UiInput
        :model-value="url"
        name="url"
        type="url"
        autocomplete="url"
        placeholder="Enter a website URL (e.g. https://example.com)"
        :error="error"
        :disabled="isBusy"
        :size="size"
        class="min-w-0 flex-1"
        @update:model-value="setUrl"
      />
      <UiButton
        type="submit"
        :size="buttonSize"
        class="sm:shrink-0"
        :disabled="!canSubmit"
      >
        {{ isBusy ? 'Scanning…' : 'Scan Website' }}
      </UiButton>
    </div>

    <label
      :for="aiToggleId"
      class="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left"
      :class="isHero ? 'mx-auto max-w-xl sm:mx-0' : ''"
    >
      <input
        :id="aiToggleId"
        type="checkbox"
        class="mt-1 size-4 rounded border-line text-accent focus:ring-accent"
        :checked="aiEnabled"
        :disabled="isBusy"
        @change="setAiEnabled(($event.target as HTMLInputElement).checked)"
      />
      <span>
        <span class="block text-sm font-semibold text-ink">Use AI analysis</span>
        <span class="mt-0.5 block text-sm text-muted">
          Off by default. When enabled, adds explanations and suggested fixes.
        </span>
      </span>
    </label>

    <p
      v-if="hint"
      class="mt-3 text-sm text-muted"
      :class="isHero ? 'text-center' : ''"
    >
      Public sites and localhost supported. No account required.
    </p>
  </form>
</template>
