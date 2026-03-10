<script setup lang="ts">
  type LinkSize = 'xs' | 'sm' | 'base' | 'lg'
  type LinkVariant = 'default' | 'primary' | 'secondary' | 'muted' | 'danger'
  type LinkWeight = 'normal' | 'medium' | 'semibold' | 'bold'

  interface LinkProps {
    /** Link destination */
    to?: string
    /** External link */
    href?: string
    /** Link size */
    size?: LinkSize
    /** Link style variant */
    variant?: LinkVariant
    /** Font weight */
    weight?: LinkWeight
    /** Show underline */
    underline?: boolean
    /** Disable link */
    disabled?: boolean
    /** Open in new tab (for external links) */
    external?: boolean
    /** Custom classes */
    className?: string
  }

  const props = withDefaults(defineProps<LinkProps>(), {
    to: undefined,
    href: undefined,
    size: 'base',
    variant: 'default',
    weight: 'normal',
    underline: false,
    disabled: false,
    external: false,
    className: ''
  })

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  }

  const variantClasses = {
    default:
      'text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300',
    primary:
      'text-slate-700 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300',
    secondary:
      'text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300',
    muted: 'text-slate-500 hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-300',
    danger: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
  }

  const computedClasses = computed(() =>
    [
      'font-sans transition-colors duration-200 focus:outline-none focus-visible:text-primary-600 dark:focus-visible:text-primary-300',
      sizeClasses[props.size],
      weightClasses[props.weight],
      props.disabled ? 'opacity-50 cursor-not-allowed' : variantClasses[props.variant],
      props.underline ? 'underline' : 'no-underline',
      props.className
    ]
      .filter(Boolean)
      .join(' ')
  )

  const linkAttrs = computed(() => {
    if (props.external && props.href) {
      return {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }
    return {}
  })
</script>

<template>
  <NuxtLink v-if="to && !disabled" :to="to" :class="computedClasses">
    <slot />
  </NuxtLink>
  <a v-else-if="href && !disabled" :href="href" :class="computedClasses" v-bind="linkAttrs">
    <slot />
  </a>
  <span v-else :class="computedClasses">
    <slot />
  </span>
</template>
