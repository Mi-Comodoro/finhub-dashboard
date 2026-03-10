<script setup lang="ts">
  import { Text } from '@/components/atoms'

  interface AppLogoProps {
    /** Show full logo with text */
    showText?: boolean
    /** Size of the logo */
    size?: 'sm' | 'md' | 'lg'
    /** Custom classes */
    className?: string
  }

  withDefaults(defineProps<AppLogoProps>(), {
    showText: true,
    size: 'md',
    className: ''
  })

  const logoSizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  const textSizes: Record<string, 'base' | 'lg' | 'xl'> = {
    sm: 'base',
    md: 'lg',
    lg: 'xl'
  }
</script>

<template>
  <div :class="['flex items-center gap-3', className]">
    <div
      :class="[
        'flex items-center justify-center rounded-lg bg-teal-600 font-bold text-white',
        logoSizes[size]
      ]"
    >
      FH
    </div>
    <Text v-if="showText" as="span" :size="textSizes[size]" weight="bold" color="inherit">
      FinHub
    </Text>
  </div>
</template>
