<script setup lang="ts">
  import type { IconBadgeProps } from '@/components/atoms'
  import { Icon } from '@/components/atoms'

  const props = withDefaults(defineProps<IconBadgeProps>(), {
    size: 'md' as 'md' | 'sm' | 'lg',
    variant: 'neutral',
    icon: 'square',
    iconClass: ''
  })

  const paddingClasses: { sm: string; md: string; lg: string } = {
    sm: 'px-1 py-2',
    md: 'p-2',
    lg: 'p-2.5'
  }

  const iconSizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  } as const

  const variantClass = {
    primary: 'bg-primary-900 text-primary-100',
    secondary: 'bg-secondary-50 text-secondary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    neutral: 'bg-neutral-50 text-neutral-600'
  } as const
  const iconResponsive = computed(() => {
    if (props.size === 'sm') return 'sm:text-sm sm:px-1'
    if (props.size === 'md') return 'md:text-md md:px-0'
    return '' // Clase por defecto o vacía
  })
</script>

<template>
  <div
    :class="[
      'flex w-fit shrink-0 rounded-lg',
      paddingClasses[size],
      variantClass[variant],
      iconClass
    ]"
  >
    <Icon :name="icon" :size="iconSizeMap[size]" :class-name="iconResponsive" />
  </div>
</template>
