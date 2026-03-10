<script setup lang="ts">
  import { computed } from 'vue'

  import { AppLogo, AppVersion } from '@/components/atoms'
  import { NavigationSection } from '@/components/molecules'

  interface MenuItem {
    name: string
    icon: string
    path: string
    isActive?: boolean
  }

  const route = useRoute()

  const menuItems: Omit<MenuItem, 'isActive'>[] = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Transacciones', icon: 'receipt_long', path: '/dashboard/transactions' },
    { name: 'Presupuesto', icon: 'account_balance_wallet', path: '/dashboard/budget' },
    { name: 'Metas de Ahorro', icon: 'savings', path: '/dashboard/goals' }
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
  <aside
    class="flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 shadow-lg transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-2xl"
  >
    <!-- Header -->
    <div class="z-10 max-h-[56px] border-gray-200 px-6 py-2 dark:border-gray-700">
      <AppLogo :class-name="'dark:text-white'" :show-text="true" />
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 space-y-2 p-4">
      <NavigationSection title="MENÚ PRINCIPAL" :items="mainMenuItems" />
      <NavigationSection title="CONFIGURACIÓN" :items="settingsMenuItems" />
    </nav>

    <!-- Version info -->
    <div class="px-6 pb-4">
      <AppVersion class="ml-1" />
    </div>
  </aside>
</template>
