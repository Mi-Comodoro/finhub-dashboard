<script setup lang="ts">
  import { Icon } from '@/components/atoms'

  withDefaults(
    defineProps<{
      modelValue: string
      value: string
      label: string
      icon?: string
      size?: 'sm' | 'md'
    }>(),
    { size: 'md', icon: undefined }
  )

  defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <button
    type="button"
    class="card-radio"
    :class="[
      size === 'sm' ? 'card-radio--sm' : 'card-radio--md',
      modelValue === value && 'card-radio--selected'
    ]"
    @click="$emit('update:modelValue', value)"
  >
    <Icon v-if="icon" :name="icon" :size="size === 'sm' ? 'sm' : 'md'" class="card-radio__icon" />
    <span class="card-radio__label">{{ label }}</span>
  </button>
</template>

<style scoped lang="postcss">
  .card-radio {
    @apply flex cursor-pointer flex-col items-center rounded-lg border border-neutral-200 transition-all;
  }

  .card-radio--md {
    @apply min-w-[80px] flex-row gap-2 p-4;
  }

  .card-radio--sm {
    @apply min-w-[64px] flex-row gap-1 p-2;
  }

  .card-radio--selected {
    @apply border-2 border-primary-500 bg-primary-50;
  }

  .card-radio__icon {
    @apply text-primary-500;
  }

  .card-radio__label {
    @apply text-sm font-medium text-neutral-900;
  }

  .card-radio--sm .card-radio__label {
    @apply text-xs;
  }
</style>
