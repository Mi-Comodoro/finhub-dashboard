<script setup lang="ts">
  import type { IconBadgeProps } from '@/components/atoms'
  import { Icon } from '@/components/atoms'

  const props = withDefaults(defineProps<IconBadgeProps>(), {
    size: 'md',
    iconClass: 'bg-slate-100 text-slate-500'
  })

  const paddingClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  }

  const iconSizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg'
  } as const

  const iconResponsive = computed(() => {
    if (props.size === 'sm') return 'sm:text-sm sm:px-1'
    if (props.size === 'md') return 'md:text-md md:px-0'
    return '' // Clase por defecto o vacía
  })
</script>

<template>
  <div :class="['shrink-0 rounded-lg', paddingClasses[size], iconClass]">
    <Icon :name="icon" :size="iconSizeMap[size]" :class-name="iconResponsive" />
  </div>
</template>
