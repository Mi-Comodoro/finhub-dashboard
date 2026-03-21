<script setup lang="ts">
  import { computed } from 'vue'

  import type { IconProps } from '@/components/atoms'

  interface LocalIconProps extends IconProps {
    name: string
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | string
    variant?: 'outlined' | 'filled' | 'sharp' | 'rounded'
    className?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<LocalIconProps>(), {
    size: 'base',
    variant: 'filled',
    className: '',
    ariaLabel: ''
  })

  const iconClasses = computed(() => {
    const baseClass = 'material-symbols-outlined'
    const variantClasses: Record<string, string> = {
      outlined: 'material-symbols-outlined',
      filled: 'material-symbols-outlined material-symbols-filled',
      sharp: 'material-icons-sharp material-symbols-outlined',
      rounded: 'material-symbols-outlined material-symbols-rounded'
    }

    const sizeClasses: Record<string, string> = {
      xs: 'text-xs',
      sm: 'text-sm sm:text-sm sm:px-1',
      base: 'text-base md:text-md md:px-1',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl'
    }

    const variantClass = variantClasses[props.variant] || baseClass

    // Si el tamaño es una cadena personalizada, la usamos directamente
    const sizeClass = sizeClasses[props.size] || props.size

    return [variantClass, sizeClass, props.className].filter(Boolean).join(' ')
  })
</script>

<template>
  <span :class="iconClasses" :aria-label="ariaLabel || name" role="img">
    {{ name }}
  </span>
</template>
<style scoped>
  /* Asegurar que los iconos mantengan sus proporciones */
  .material-symbols-outlined,
  .material-symbols-filled,
  .material-symbols-rounded,
  .material-icons-sharp {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
    font-feature-settings: 'liga';
    display: inline-block;
    vertical-align: middle;
  }

  .material-symbols-filled {
    font-variation-settings: 'FILL' 1;
  }
</style>
