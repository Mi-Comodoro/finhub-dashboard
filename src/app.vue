<script setup lang="ts">
  import { useTheme } from '~/composables/useTheme'

  // Initialize theme on app mount
  const { initTheme } = useTheme()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
