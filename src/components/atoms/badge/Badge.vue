<!--
  Badge Component
  Atom component for displaying status indicators, labels, and notifications
-->

<script setup lang="ts">
  import type { BadgeProps } from './types/badge.types'

  withDefaults(defineProps<BadgeProps>(), {
    variant: 'default',
    size: 'xs',
    rounded: true,
    bold: true,
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
      {
        'badge--bold': bold,
        'badge--default': !bold
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
    @apply inline-flex items-center justify-center transition-colors;
  }

  /* Rounded variants */
  .badge--rounded {
    @apply rounded-full;
  }

  .badge--square {
    @apply rounded-md;
  }

  .badge--bold {
    @apply !font-bold;
  }
  .badge--default {
    @apply font-medium;
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
    @apply dark:bg-neutral-700 dark:text-neutral-200;
  }

  .badge--primary {
    @apply bg-primary-200 text-primary-900;
    @apply dark:bg-primary-900 dark:text-primary-200;
  }

  .badge--secondary {
    @apply bg-secondary-100 text-secondary-800;
    @apply dark:bg-secondary-900 dark:text-secondary-200;
  }

  .badge--success {
    @apply bg-success-100 text-success-900;
    @apply dark:bg-success-900 dark:text-success-200;
  }

  .badge--warning {
    @apply bg-warning-100 text-warning-800;
    @apply dark:bg-warning-900 dark:text-warning-200;
  }

  .badge--danger {
    @apply bg-danger-100 text-danger-800;
    @apply dark:bg-danger-900 dark:text-danger-200;
  }

  .badge--info {
    @apply bg-secondary-100 text-secondary-800;
    @apply dark:bg-secondary-900 dark:text-secondary-200;
  }

  /* Outline variants */
  .badge--outline {
    @apply border bg-transparent;
  }

  .badge--outline.badge--default {
    @apply border-neutral-300 text-neutral-700;
    @apply dark:border-neutral-600 dark:text-neutral-300;
  }

  .badge--outline.badge--primary {
    @apply border-primary-300 text-primary-900;
    @apply dark:border-primary-600 dark:text-primary-300;
  }

  .badge--outline.badge--secondary {
    @apply border-indigo-300 text-indigo-700;
    @apply dark:border-indigo-600 dark:text-indigo-300;
  }

  .badge--outline.badge--success {
    @apply border-green-300 text-green-700;
    @apply dark:border-green-600 dark:text-green-300;
  }

  .badge--outline.badge--warning {
    @apply border-yellow-300 text-yellow-700;
    @apply dark:border-yellow-600 dark:text-yellow-300;
  }

  .badge--outline.badge--danger {
    @apply border-red-300 text-red-700;
    @apply dark:border-red-600 dark:text-red-300;
  }

  .badge--outline.badge--info {
    @apply border-blue-300 text-blue-700;
    @apply dark:border-blue-600 dark:text-blue-300;
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
