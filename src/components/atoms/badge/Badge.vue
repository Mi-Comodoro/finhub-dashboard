<!--
  Badge Component
  Atom component for displaying status indicators, labels, and notifications
-->

<script setup lang="ts">
  import type { BadgeProps } from './types/badge.types'

  withDefaults(defineProps<BadgeProps>(), {
    variant: 'default',
    size: 'md',
    rounded: true,
    className: ''
  })
</script>

<template>
  <span
    :class="[
      'badge',
      `badge--${variant}`,
      `badge--${size}`,
      {
        'badge--rounded': rounded,
        'badge--square': !rounded
      },
      className
    ]"
  >
    <slot>{{ text }}</slot>
  </span>
</template>

<style lang="postcss" scoped>
  /* Base Badge Styles */
  .badge {
    @apply inline-flex items-center justify-center font-medium transition-colors;
  }

  /* Rounded variants */
  .badge--rounded {
    @apply rounded-full;
  }

  .badge--square {
    @apply rounded-md;
  }

  /* Size variants */
  .badge--xs {
    @apply px-2 py-0.5 text-xs;
  }

  .badge--sm {
    @apply px-2.5 py-1 text-xs;
  }

  .badge--md {
    @apply px-3 py-1 text-xs;
  }

  .badge--lg {
    @apply px-4 py-1.5 text-sm;
  }

  /* Color variants */
  .badge--default {
    @apply bg-neutral-100 text-neutral-800;
  }

  .badge--primary {
    @apply bg-primary-100 text-primary-800;
  }

  .badge--secondary {
    @apply bg-indigo-100 text-indigo-800;
  }

  .badge--success {
    @apply bg-green-100 text-green-800;
  }

  .badge--warning {
    @apply bg-yellow-100 text-yellow-800;
  }

  .badge--danger {
    @apply bg-red-100 text-red-800;
  }

  .badge--info {
    @apply bg-blue-100 text-blue-800;
  }

  /* Outline variants */
  .badge--outline {
    @apply border bg-transparent;
  }

  .badge--outline.badge--default {
    @apply border-neutral-300 text-neutral-700;
  }

  .badge--outline.badge--primary {
    @apply border-primary-300 text-primary-700;
  }

  .badge--outline.badge--secondary {
    @apply border-indigo-300 text-indigo-700;
  }

  .badge--outline.badge--success {
    @apply border-green-300 text-green-700;
  }

  .badge--outline.badge--warning {
    @apply border-yellow-300 text-yellow-700;
  }

  .badge--outline.badge--danger {
    @apply border-red-300 text-red-700;
  }

  .badge--outline.badge--info {
    @apply border-blue-300 text-blue-700;
  }

  /* Solid color variants (for dark backgrounds) */
  .badge--solid {
    @apply text-white;
  }

  .badge--solid.badge--default {
    @apply bg-neutral-600;
  }

  .badge--solid.badge--primary {
    @apply bg-primary-600;
  }

  .badge--solid.badge--secondary {
    @apply bg-indigo-600;
  }

  .badge--solid.badge--success {
    @apply bg-primary-500;
  }

  .badge--solid.badge--warning {
    @apply bg-yellow-600;
  }

  .badge--solid.badge--danger {
    @apply bg-red-600;
  }

  .badge--solid.badge--info {
    @apply bg-blue-600;
  }

  /* Interactive variants (for clickable badges) */
  .badge--interactive {
    @apply cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1;
  }

  .badge--interactive.badge--primary {
    @apply focus:ring-primary-500;
  }

  .badge--interactive.badge--secondary {
    @apply focus:ring-indigo-500;
  }

  .badge--interactive.badge--success {
    @apply focus:ring-green-500;
  }

  .badge--interactive.badge--warning {
    @apply focus:ring-yellow-500;
  }

  .badge--interactive.badge--danger {
    @apply focus:ring-red-500;
  }
</style>
