<script setup lang="ts">
  import { computed } from 'vue'

  import type { IconProps } from '@/components/atoms'

  interface LocalIconProps extends IconProps {
    name: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | string
    variant?: 'outlined' | 'filled' | 'sharp' | 'rounded'
    className?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<LocalIconProps>(), {
    size: 'md',
    variant: 'filled',
    className: '',
    ariaLabel: ''
  })

  const iconClasses = computed(() => {
    // 1. Mapeo de variantes de Material Symbols
    const variantMap: Record<string, string> = {
      outlined: 'material-symbols-outlined',
      filled: 'material-symbols-outlined material-symbols-filled',
      sharp: 'material-icons-sharp material-symbols-outlined',
      rounded: 'material-symbols-outlined material-symbols-rounded'
    }

    // 2. Mapeo de tamaños (Corregido md:text-base)
    const sizeMap: Record<string, string> = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: '',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    }

    const variantClass = variantMap[props.variant] || variantMap.outlined
    const sizeClass = sizeMap[props.size] || props.size

    // Unimos clases evitando duplicados y asegurando que className vaya al final
    return `${variantClass} ${sizeClass} ${props.className}`.trim()
  })
</script>

<template>
  <span
    :class="iconClasses"
    :aria-label="ariaLabel || name"
    class="flex select-none items-center justify-center"
  >
    {{ name }}
  </span>
</template>

<style scoped>
  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
    font-feature-settings: 'liga';
    display: inline-flex; /* Cambiado a inline-flex para mejor centrado */
    line-height: 1; /* Evita que el line-height del texto mueva el icono */
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
  }

  .material-symbols-filled {
    font-variation-settings: 'FILL' 1;
  }
</style>
