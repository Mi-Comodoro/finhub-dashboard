<script setup lang="ts">
  import { Icon } from '@/components/atoms'

  import type { IconChipProps } from './types/icon-chip.types'

  const props = withDefaults(defineProps<IconChipProps>(), {
    containerClass: '',
    iconClass: '',
    size: 'md',
    variant: 'neutral'
  })

  const variantClass = {
    primary: 'bg-primary-100 text-primary-500',
    secondary: 'bg-secondary-100 text-secondary-500',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    neutral: 'bg-gray-100 text-gray-500'
  }
</script>

<template>
  <div :class="['icon-chip', variantClass[props.variant], containerClass]">
    <Icon :name="icon" :size="size" :class="['icon-chip__icon', iconClass]" />
  </div>
</template>

<style lang="postcss" scoped>
  .icon-chip {
    @apply inline-flex items-center justify-center rounded-lg border border-transparent p-2;
  }
</style>
