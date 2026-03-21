<script setup lang="ts">
  /**
   * StatusIndicator Component
   * Atom-level component for displaying status with dot and text
   */

  interface Props {
    status?: 'active' | 'inactive' | 'pending' | 'error' | 'default'
    text?: string
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    status: 'active',
    text: 'Activo',
    size: 'md'
  })

  const statusClasses = computed(() => {
    const statusMap = {
      active: 'bg-green-500',
      inactive: 'bg-neutral-400',
      pending: 'bg-yellow-500',
      error: 'bg-red-500',
      default: 'bg-green-500'
    }
    return statusMap[props.status]
  })

  const textColors = computed(() => {
    const colorMap = {
      active: 'text-green-600',
      inactive: 'text-neutral-600',
      pending: 'text-yellow-600',
      default: 'text-neutral-900',
      error: 'text-red-600'
    }
    return colorMap[props.status]
  })

  const sizeClasses = computed(() => {
    const sizeMap = {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5'
    }
    return sizeMap[props.size]
  })

  const textSizeClasses = computed(() => {
    const textSizeMap = {
      sm: 'text-xs font-medium',
      md: 'text-sm font-semibold',
      lg: 'text-base font-bold'
    }
    return textSizeMap[props.size]
  })
</script>

<template>
  <div class="flex items-center space-x-2">
    <div class="rounded-full" :class="[statusClasses, sizeClasses]"></div>
    <span :class="[textColors, textSizeClasses]">
      {{ text }}
    </span>
  </div>
</template>
