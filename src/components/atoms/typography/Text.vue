<script setup lang="ts">
  import type { TextAlign, TextColor, TextSize, TextWeight } from './types/text.types'

  interface TextProps {
    /** Text size */
    size?: TextSize
    /** Font weight */
    weight?: TextWeight
    /** Text color */
    color?: TextColor
    /** Text alignment */
    align?: TextAlign
    /** Make text italic */
    italic?: boolean
    /** Make text uppercase */
    uppercase?: boolean
    /** Truncate text with ellipsis */
    truncate?: boolean
    /** Add underline */
    underline?: boolean
    /** Line height */
    leading?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'
    /** Custom classes */
    className?: string
    /** HTML element to render */
    as?: 'p' | 'span' | 'div' | 'strong' | 'em'
  }

  const props = withDefaults(defineProps<TextProps>(), {
    size: 'base',
    weight: 'normal',
    color: 'default',
    align: 'left',
    italic: false,
    uppercase: false,
    truncate: false,
    underline: false,
    leading: 'normal',
    className: '',
    as: 'p'
  })

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const colorClasses = {
    default: 'text-neutral-900 dark:text-neutral-100',
    primary: 'text-primary-600 dark:text-white',
    secondary: 'text-secondary-600 dark:text-slate-300',
    muted: 'text-slate-600 dark:text-slate-400',
    accent: 'text-primary-600 dark:text-teal-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    white: 'text-white',
    black: 'text-black dark:text-neutral-100',
    inherit: 'text-inherit'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }

  const leadingClasses = {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  }

  // Paragraphs default to relaxed leading; other elements keep normal
  const effectiveLeading = computed(() =>
    props.leading === 'normal' && props.as === 'p' ? 'relaxed' : props.leading
  )

  const computedClasses = computed(() =>
    [
      'font-sans',
      sizeClasses[props.size],
      weightClasses[props.weight],
      colorClasses[props.color],
      alignClasses[props.align],
      leadingClasses[effectiveLeading.value],
      props.italic ? 'italic' : '',
      props.uppercase ? 'uppercase' : '',
      props.truncate ? 'truncate' : '',
      props.underline ? 'underline' : '',
      props.className
    ]
      .filter(Boolean)
      .join(' ')
  )
</script>

<template>
  <component :is="as" :class="computedClasses">
    <slot />
  </component>
</template>
