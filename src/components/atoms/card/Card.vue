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
    @apply rounded-lg border border-gray-200 bg-white;
  }

  .card--elevated {
    @apply shadow-sm;
  }
</style>
