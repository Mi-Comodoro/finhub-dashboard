<script setup lang="ts">
  import { onMounted } from 'vue'

  import { Icon } from '@/components/atoms'
  import { Breadcrumbs, HeaderActions, Input } from '@/components/molecules'
  import { useBreadcrumbNavigation } from '@/composables/useBreadcrumbNavigation'

  import type { DashboardHeaderProps } from './types/dashboard-header.types'
  const router = useRouter()
  // Initialize auto breadcrumb navigation
  useBreadcrumbNavigation({
    autoUpdate: true,
    homeLabel: 'Dashboard'
  })

  withDefaults(defineProps<DashboardHeaderProps>(), {
    title: '',
    className: ''
  })

  // Simulate last connection time - avoid SSR hydration mismatch

  onMounted(() => {})
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
      <div class="flex items-center space-x-1">
        <div class="container mx-auto flex gap-2">
          <Icon name="arrow_back" class="cursor-pointer" @click="router.back()" />
          <Breadcrumbs :max-items="4" class="hidden xl:flex" />
        </div>
        <!--  <div class="flex flex-col">
          <Heading level="h1" size="lg" weight="bold">Hola, {{ userName }}!</Heading>
          <Text size="xs" color="muted">
            <Icon name="schedule" size="xs" class="mr-1" />
            <span>Resumen de tus Finanzas Hoy, {{ lastConnection }}</span>
          </Text>
        </div> -->
      </div>
      <div class="flex items-center gap-4">
        <div>
          <Input type="search" search-icon placeholder="Buscar Movimientos..." />
        </div>
        <!-- Header Actions -->
        <HeaderActions />
      </div>
    </div>
  </header>
</template>
