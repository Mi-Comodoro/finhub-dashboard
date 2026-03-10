<script setup lang="ts">
  import { useTheme } from '~/composables/useTheme'

  // Initialize theme on app mount
  const { initTheme } = useTheme()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <div class="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
    <slot />
  </div>
</template>
