<script setup lang="ts">
  import type { LabelColor, LabelSize, LabelVariant, LegacyLabelVariant } from './types/label.types'
  import type { TextWeight } from './types/text.types'

  interface LabelProps {
    /** Label size */
    size?: LabelSize
    /** Text color */
    color?: LabelColor
    /** Label variant with predefined styles */
    variant?: LabelVariant | LegacyLabelVariant
    weight?: TextWeight
    /** Make text uppercase */
    uppercase?: boolean
    /** Required field indicator */
    required?: boolean
    /** Custom classes */
    className?: string
    /** For attribute for form labels */
    htmlFor?: string
    /** Legacy for attribute support */
    forId?: string
    /** Legacy text support */
    text?: string
  }

  const props = withDefaults(defineProps<LabelProps>(), {
    size: 'sm',
    color: 'black',
    variant: 'default',
    uppercase: false,
    required: false,
    className: '',
    htmlFor: undefined,
    forId: undefined,
    text: '',
    weight: 'normal'
  })

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base'
  }

  const colorClasses = {
    primary: 'text-primary-900 dark:text-white',
    secondary: 'text-secondary-700 dark:text-slate-300',
    muted: 'text-slate-500 dark:text-slate-400',
    accent: 'text-primary-600 dark:text-teal-400',
    white: 'text-white',
    black: 'text-black'
  }

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }
  const variantClasses = {
    default: '',
    section: 'font-semibold uppercase tracking-wider',
    form: 'font-medium',
    badge: 'font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded'
  }

  const normalizedVariant = computed<LabelVariant>(() => {
    if (props.variant === 'row' || props.variant === 'column') {
      return 'form'
    }

    return props.variant
  })

  const effectiveHtmlFor = computed(() => props.htmlFor || props.forId)

  const textFallback = computed(() => props.text || '')

  const computedClasses = computed(() =>
    [
      'font-sans',
      sizeClasses[props.size],
      colorClasses[props.color],
      variantClasses[normalizedVariant.value],
      weightClasses[props.weight],
      props.uppercase && props.variant !== 'section' ? 'uppercase' : '',
      props.className
    ]
      .filter(Boolean)
      .join(' ')
  )
</script>

<template>
  <label v-if="effectiveHtmlFor" :for="effectiveHtmlFor" :class="computedClasses">
    <slot>{{ textFallback }}</slot>
    <span v-if="required" class="ml-1 text-red-500">*</span>
  </label>
  <span v-else :class="computedClasses">
    <slot>{{ textFallback }}</slot>
    <span v-if="required" class="ml-1 text-red-500">*</span>
  </span>
</template>
