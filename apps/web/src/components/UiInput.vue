<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: string
    name?: string
    autocomplete?: string
    error?: string | null
    disabled?: boolean
    size?: 'md' | 'hero'
  }>(),
  {
    label: undefined,
    placeholder: '',
    type: 'text',
    name: undefined,
    autocomplete: undefined,
    error: null,
    disabled: false,
    size: 'md',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = useId()
const describedBy = computed(() => (props.error ? `${id}-error` : undefined))

const inputClass = computed(() =>
  [
    'w-full rounded-xl border border-line bg-white text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-60',
    props.size === 'hero'
      ? 'h-14 px-5 text-base shadow-soft sm:h-16 sm:px-6 sm:text-lg'
      : 'h-12 px-4 text-base shadow-soft',
  ].join(' '),
)
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="id"
      class="mb-2 block text-sm font-medium text-ink"
    >
      {{ label }}
    </label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="describedBy"
      :class="inputClass"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p
      v-if="error"
      :id="describedBy"
      class="mt-2 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
