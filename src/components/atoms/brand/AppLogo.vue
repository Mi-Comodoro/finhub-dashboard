<script setup lang="ts">
  import type { AppLogoProps, LogoSize } from './types/app-logo.types'

  withDefaults(defineProps<AppLogoProps>(), {
    showText: true,
    size: 'md',
    className: ''
  })

  const logoSizes: Record<LogoSize, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }
</script>

<template>
  <div :class="['flex items-center gap-3', className]">
    <span
      :class="[
        'flex items-center justify-center rounded-lg bg-teal-900 font-bold text-white',
        logoSizes[size]
      ]"
    >
      MC
    </span>
    <CardInfo
      v-if="showText"
      title="Mi Comodoro"
      title-size="lg"
      level="h2"
      color="black"
      weight="extrabold"
      sub-title="Gestion financiera"
      sub-title-size="xs"
      sub-title-color="muted"
    />
  </div>
</template>
