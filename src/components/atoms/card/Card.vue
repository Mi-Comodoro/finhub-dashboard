<script setup lang="ts">
  import type { CardProps } from '@/components/atoms'

  withDefaults(defineProps<CardProps>(), {
    as: 'div',
    variant: 'default',
    className: ''
  })
</script>

<template>
  <component :is="as" :class="['card', `card--${variant}`, className]">
    <slot />
  </component>
</template>

<style lang="postcss" scoped>
  .card {
    @apply rounded-lg border border-neutral-200 bg-white p-4;
  }

  .card--primary {
    @apply border-primary-200 bg-primary-500;
  }
  .card--elevated {
    @apply shadow-sm;
  }
</style>
