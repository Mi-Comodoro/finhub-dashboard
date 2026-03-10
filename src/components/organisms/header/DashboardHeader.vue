<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import { Icon } from '@/components/atoms'
  import { HeaderActions } from '@/components/molecules'

  interface DashboardHeaderProps {
    /** Header title */
    title?: string
    /** Custom classes */
    className?: string
  }

  withDefaults(defineProps<DashboardHeaderProps>(), {
    title: '',
    className: ''
  })

  // Simulate last connection time - avoid SSR hydration mismatch
  const lastConnection = ref('')

  onMounted(() => {
    const now = new Date()
    const lastAccess = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h

    lastConnection.value = lastAccess.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  })
</script>

<template>
  <header
    :class="[
      'z-10 max-h-[56px] border-b border-slate-200 bg-white px-4 py-2 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900',
      className
    ]"
  >
    <div class="flex h-full items-center justify-between">
      <!-- Last connections info -->
      <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <Icon name="schedule" size="xs" class="mr-1" />
        <span>Última conexión: {{ lastConnection }}</span>
      </div>

      <!-- Header Actions -->
      <HeaderActions />
    </div>
  </header>
</template>
