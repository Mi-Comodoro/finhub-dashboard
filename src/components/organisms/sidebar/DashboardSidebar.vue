<script setup lang="ts">
  import { computed } from 'vue'

  import { AppLogo, AppVersion } from '@/components/atoms'
  import { NavigationSection } from '@/components/molecules'
  import { useAuthStore } from '~/stores/auth.store'

  import type { MenuItem } from './types/dashboard-sidebar.types'
  const route = useRoute()

  const { accountType } = useAuthStore()
  const menuItems: Omit<MenuItem, 'isActive'>[] = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Presupuesto', icon: 'account_balance_wallet', path: '/dashboard/budget' },
    { name: 'Metas de Ahorro', icon: 'savings', path: '/dashboard/goals' },
    { name: 'Transacciones', icon: 'receipt_long', path: '/dashboard/transactions' }
  ]

  const settingsItems: Omit<MenuItem, 'isActive'>[] = [
    { name: 'Mi Perfil', icon: 'person', path: '/dashboard/profile' }
  ]

  const mainMenuItems = computed<MenuItem[]>(() => {
    return menuItems.map(item => ({
      ...item,
      isActive: isActiveRoute(item.path, route.path)
    }))
  })

  const settingsMenuItems = computed<MenuItem[]>(() => {
    return settingsItems.map(item => ({
      ...item,
      isActive: isActiveRoute(item.path, route.path)
    }))
  })

  // Helper function to determine if a route is active
  const isActiveRoute = (itemPath: string, currentPath: string): boolean => {
    // Exact match
    if (currentPath === itemPath) return true

    // Handle dashboard root special case
    if (
      itemPath === '/dashboard' &&
      (currentPath === '/dashboard/' || currentPath === '/dashboard')
    ) {
      return true
    }

    // For other routes, check if current path starts with item path
    // but make sure we don't match partial paths (e.g., /dashboard/budgets shouldn't match /dashboard/budget)
    if (itemPath !== '/dashboard' && currentPath.startsWith(itemPath)) {
      const remainder = currentPath.slice(itemPath.length)
      return remainder === '' || remainder.startsWith('/')
    }

    return false
  }
</script>

<template>
  <aside class="dashboard-sidebar">
    <div class="dashboard-sidebar__header">
      <AppLogo :class-name="'dark:text-white'" :show-text="true" />
    </div>
    <nav class="dashboard-sidebar__nav">
      <NavigationSection title="MENÚ PRINCIPAL" :items="mainMenuItems" />
      <NavigationSection title="CONFIGURACIÓN" :items="settingsMenuItems" />
    </nav>
    <div class="dashboard-sidebar__version">
      <Card as="div" class="my-2 p-2" class-name="!bg-primary-900 !rounded-md !border-primary-100">
        <CardInfo
          level="h3"
          title-size="sm"
          title="Estado"
          weight="bold"
          color="white"
          :sub-title="
            accountType?.toUpperCase() === 'TRIAL'
              ? 'Periodo de Prueba'
              : accountType?.toUpperCase() === 'PREMIUM'
                ? 'Premium'
                : 'FREE'
          "
          sub-title-color="warning"
          sub-title-size="xs"
        />
      </Card>
      <AppVersion class="ml-1" size="xs" />
    </div>
  </aside>
</template>

<style scoped lang="postcss">
  .dashboard-sidebar {
    @apply flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 shadow-lg transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-2xl;
  }
  .dashboard-sidebar__header {
    @apply z-10 max-h-[56px] border-neutral-200 px-6 py-2 dark:border-neutral-700;
  }
  .dashboard-sidebar__nav {
    @apply flex-1 space-y-2 p-4;
  }
  .dashboard-sidebar__version {
    @apply px-6 pb-4;
  }
</style>
