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
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    neutral: 'bg-neutral-50 text-neutral-600'
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
