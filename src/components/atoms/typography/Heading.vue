<script setup lang="ts">
  type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  type HeadingSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  type HeadingColor =
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'white'
    | 'black'

  interface HeadingProps {
    /** HTML heading level (semantic) */
    level?: HeadingLevel
    /** Visual size (can be different from level for visual hierarchy) */
    size?: HeadingSize
    /** Font weight */
    weight?: HeadingWeight
    /** Text color */
    color?: HeadingColor
    /** Make text uppercase */
    uppercase?: boolean
    /** Add letter spacing */
    tracking?: 'tight' | 'normal' | 'wide' | 'wider' | 'widest'
    /** Custom classes */
    className?: string
  }

  const props = withDefaults(defineProps<HeadingProps>(), {
    level: 'h2',
    size: 'base',
    weight: 'semibold',
    color: 'primary',
    uppercase: false,
    tracking: 'normal',
    className: ''
  })

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  }

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  }

  const colorClasses = {
    primary: 'text-slate-900 dark:text-white',
    secondary: 'text-slate-700 dark:text-slate-300',
    muted: 'text-slate-500 dark:text-slate-400',
    accent: 'text-teal-600 dark:text-teal-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    white: 'text-white',
    black: 'text-black'
  }

  const trackingClasses = {
    tight: 'tracking-tight',
    normal: 'tracking-normal',
    wide: 'tracking-wide',
    wider: 'tracking-wider',
    widest: 'tracking-widest'
  }

  // Auto line-height: large headings are tighter, mid headings snug
  const autoLeading = computed(() => {
    if (['2xl', '3xl', '4xl'].includes(props.size)) return 'leading-tight'
    if (['lg', 'xl'].includes(props.size)) return 'leading-snug'
    return ''
  })

  const computedClasses = computed(() =>
    [
      'font-sans',
      sizeClasses[props.size],
      weightClasses[props.weight],
      colorClasses[props.color],
      trackingClasses[props.tracking],
      autoLeading.value,
      props.uppercase ? 'uppercase' : '',
      props.className
    ]
      .filter(Boolean)
      .join(' ')
  )
</script>

<template>
  <component :is="level" :class="computedClasses">
    <slot />
  </component>
</template>
