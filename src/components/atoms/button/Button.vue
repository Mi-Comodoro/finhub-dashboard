<script setup lang="ts">
  import { computed } from 'vue'

  import type { ButtonProps } from './types/button.types'

  const props = withDefaults(defineProps<ButtonProps>(), {
    type: 'button',
    variant: 'primary',
    size: 'md',
    iconPosition: 'left',
    disabled: false,
    loading: false,
    iconOnly: false,
    icon: '',
    fullWidth: false
  })

  /* =========================
   * Helpers
   * =======================*/

  const tooltipText = computed(() => (props.iconOnly && props.icon ? props.icon : undefined))

  const iconOrderClass = computed(() =>
    props.iconPosition === 'right' ? 'order-last' : 'order-first'
  )

  /* =========================
   * Class maps
   * =======================*/

  const BASE_CLASSES =
    'inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900'

  const SIZE_CLASSES = {
    sm: {
      default: 'min-h-8 px-3 py-1.5 text-sm min-w-[5rem]',
      icon: 'h-8 w-8 p-0'
    },
    md: {
      default: 'min-h-10 px-4 py-2 text-sm min-w-[6rem]',
      icon: 'h-10 w-10 p-0'
    },
    lg: {
      default: 'min-h-12 px-6 py-3 text-base min-w-[7rem]',
      icon: 'h-12 w-12 p-0'
    }
  }

  const VARIANT_CLASSES = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 font-extrabold',

    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-600 dark:hover:bg-secondary-700 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 font-extrabold',

    outline:
      'border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 font-extrabold',

    danger:
      'bg-danger-500 text-white hover:bg-danger-700 dark:bg-danger-500 dark:hover:bg-danger-700 focus:ring-danger-500 disabled:cursor-not-allowed disabled:opacity-50 font-extrabold',

    ghost:
      'bg-gray-100 border border-slate-200 text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:opacity-50 font-extrabold'
  }

  /* =========================
   * Computed classes
   * =======================*/

  const sizeClass = computed(() =>
    props.iconOnly ? SIZE_CLASSES[props.size].icon : SIZE_CLASSES[props.size].default
  )

  const stateClasses = computed(() => ({
    'w-full': props.fullWidth
  }))

  const classes = computed(() => [
    BASE_CLASSES,
    sizeClass.value,
    VARIANT_CLASSES[props.variant],
    stateClasses.value
  ])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    :title="tooltipText"
    :aria-label="tooltipText"
  >
    <!-- Loader -->
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        class="opacity-25"
      />
      <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>

    <!-- Icon -->
    <span
      v-if="icon && !loading"
      class="material-icons-sharp material-symbols-outlined text-base"
      :class="iconOrderClass"
    >
      {{ icon }}
    </span>

    <!-- Text -->
    <span v-if="$slots.default && !iconOnly && !loading">
      <slot />
    </span>
  </button>
</template>
