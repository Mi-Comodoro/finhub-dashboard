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
    props.iconPosition === 'right' ? 'btn__icon--right' : 'btn__icon--left'
  )

  /* =========================
   * BEM Modifiers
   * =======================*/

  const classes = computed(() => ({
    [`btn--${props.variant}`]: true,
    [`btn--${props.size}`]: true,
    'btn--icon-only': props.iconOnly,
    'btn--loading': props.loading,
    'btn--full': props.fullWidth
  }))
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="btn"
    :class="classes"
    :title="tooltipText"
    :aria-label="tooltipText"
  >
    <!-- Loader -->
    <svg v-if="loading" class="btn__loader" viewBox="0 0 24 24">
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
      class="btn__icon material-icons-sharp material-symbols-outlined"
      :class="iconOrderClass"
    >
      {{ icon }}
    </span>

    <!-- Text -->
    <span v-if="$slots.default && !iconOnly && !loading" class="btn__text">
      <slot />
    </span>
  </button>
</template>

<style scoped lang="postcss">
  /* =========================
   Base
   =======================*/

  .btn {
    @apply inline-flex select-none items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900;
  }

  /* =========================
   Sizes
   =======================*/

  .btn--sm {
    @apply min-h-8 px-3 py-1.5 text-sm;
  }

  .btn--md {
    @apply min-h-10 px-4 py-2 text-sm;
  }

  .btn--lg {
    @apply min-h-12 px-6 py-3 text-base;
  }

  /* Icon only */

  /* =========================
   Icon Only
   =======================*/

  .btn--icon-only {
    @apply gap-0;
  }

  .btn--icon-only.btn--sm {
    @apply h-8 w-8;
  }

  .btn--icon-only.btn--md {
    @apply h-10 w-10;
  }

  .btn--icon-only.btn--lg {
    @apply h-12 w-12;
  }

  /* =========================
   Variants
   =======================*/

  .btn--primary {
    @apply bg-primary-900 text-white hover:bg-primary-900 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-50;
  }

  .btn--secondary {
    @apply bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:opacity-50;
  }

  .btn--outline {
    @apply border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 focus:ring-secondary-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500;
  }

  .btn--danger {
    @apply bg-danger-500 text-white hover:bg-danger-700 focus:ring-danger-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500;
  }

  .btn--ghost {
    @apply border border-slate-200 bg-neutral-100 text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500;
  }

  /* =========================
   States
   =======================*/

  .btn--full {
    @apply w-full;
  }

  /* =========================
   Elements
   =======================*/

  .btn__icon {
    @apply text-base;
  }

  .btn__icon--right {
    @apply order-last;
  }

  .btn__icon--left {
    @apply order-first;
  }

  .btn__loader {
    @apply h-4 w-4 animate-spin;
  }

  .btn__text {
    @apply leading-none;
  }
</style>
