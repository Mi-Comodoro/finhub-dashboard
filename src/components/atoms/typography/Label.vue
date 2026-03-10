<script setup lang="ts">
  type LabelSize = 'xs' | 'sm' | 'base'
  type LabelColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'white'
  type LabelVariant = 'default' | 'section' | 'form' | 'badge'
  type LegacyLabelVariant = 'row' | 'column'

  interface LabelProps {
    /** Label size */
    size?: LabelSize
    /** Text color */
    color?: LabelColor
    /** Label variant with predefined styles */
    variant?: LabelVariant | LegacyLabelVariant
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
    color: 'secondary',
    variant: 'default',
    uppercase: false,
    required: false,
    className: '',
    htmlFor: undefined,
    forId: undefined,
    text: ''
  })

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base'
  }

  const colorClasses = {
    primary: 'text-slate-900 dark:text-white',
    secondary: 'text-slate-700 dark:text-slate-300',
    muted: 'text-slate-500 dark:text-slate-400',
    accent: 'text-teal-600 dark:text-teal-400',
    white: 'text-white'
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
