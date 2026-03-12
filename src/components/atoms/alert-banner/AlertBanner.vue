<!--
  AlertBanner
  Atom component for contextual inline alerts and informational banners
-->

<script setup lang="ts">
  import type { AlertBannerProps, AlertVariant, VariantClasses } from './types/alert-banner.types'

  const props = withDefaults(defineProps<AlertBannerProps>(), {
    variant: 'info',
    icon: undefined,
    title: undefined
  })

  const DEFAULT_ICONS: Record<AlertVariant, string> = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
    neutral: 'notifications',
    purple: 'auto_awesome'
  }

  const resolvedIcon = computed(() => props.icon ?? DEFAULT_ICONS[props.variant])

  const VARIANT_CLASSES: Record<AlertVariant, VariantClasses> = {
    info: {
      wrapper: 'bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-800/40',
      icon: 'text-teal-500 dark:text-teal-400',
      title: 'text-teal-800 dark:text-teal-200'
    },
    success: {
      wrapper: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/40',
      icon: 'text-green-500 dark:text-green-400',
      title: 'text-green-800 dark:text-green-200'
    },
    warning: {
      wrapper: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/40',
      icon: 'text-yellow-500 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200'
    },
    danger: {
      wrapper: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/40',
      icon: 'text-red-500 dark:text-red-400',
      title: 'text-red-800 dark:text-red-200'
    },
    neutral: {
      wrapper: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
      icon: 'text-slate-400 dark:text-slate-500',
      title: 'text-slate-700 dark:text-slate-200'
    },
    purple: {
      wrapper: 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/50',
      icon: 'text-purple-600 dark:text-purple-300',
      title: 'text-purple-800 dark:text-purple-200'
    }
  }

  const classes = computed(() => VARIANT_CLASSES[props.variant])
</script>

<template>
  <div :class="['alert-banner', classes.wrapper]" role="alert">
    <span
      class="alert-banner__icon material-symbols-outlined"
      :class="classes.icon"
      aria-hidden="true"
    >
      {{ resolvedIcon }}
    </span>

    <div class="alert-banner__content">
      <p v-if="title" :class="['alert-banner__title', classes.title]">
        {{ title }}
      </p>
      <div class="alert-banner__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .alert-banner {
    @apply flex items-start gap-3 rounded-xl border px-4 py-3;
  }
  .alert-banner__icon {
    @apply mt-0.5 shrink-0 text-[1.1rem] leading-none;
  }
  .alert-banner__content {
    @apply min-w-0 flex-1;
  }
  .alert-banner__title {
    @apply mb-0.5 text-sm font-semibold;
  }
  .alert-banner__body {
    @apply text-sm text-slate-600 dark:text-slate-400;
  }
</style>
