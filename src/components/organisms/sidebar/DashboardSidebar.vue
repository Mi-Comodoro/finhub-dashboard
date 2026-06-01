<script setup lang="ts">
  import { computed } from 'vue'

  import AppLogo from '@/components/atoms/brand/AppLogo.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import AppVersion from '@/components/atoms/version/AppVersion.vue'
  import NavigationSection from '@/components/molecules/navigation/NavigationSection.vue'
  import { useSidebarMode } from '@/composables/ui/useSidebarMode'
  import { useSidebar } from '@/composables/useSidebar'
  import { useAuthStore } from '@/stores/auth.store'
  import { useFriendshipsStore } from '@/stores/friendships.store'

  import type { MenuItem } from './types/dashboard-sidebar.types'

  const route = useRoute()
  const authStore = useAuthStore()
  const friendshipsStore = useFriendshipsStore()

  const { isCollapsed, toggleCollapse, close } = useSidebar()
  const { isAdminMode, toggle } = useSidebarMode()

  const pendingRequestsCount = computed(() => friendshipsStore.pendingCount)

  const emit = defineEmits<{
    navigate: []
  }>()

  // Sync cookie with the current route so that navigating directly to /admin
  // (or refreshing there) always shows the admin nav, not the user nav.
  watch(
    () => route.path,
    path => {
      const shouldBeAdmin = path.startsWith('/admin')
      if (shouldBeAdmin !== isAdminMode.value) toggle()
    },
    { immediate: true }
  )

  const handleNavigate = () => {
    close()
    emit('navigate')
  }

  const handleToggle = () => {
    const target = isAdminMode.value ? '/dashboard' : '/admin'
    toggle()
    navigateTo(target)
  }

  const userMenuItems = computed<Omit<MenuItem, 'isActive'>[]>(() => [
    { name: 'Dashboard', icon: 'dashboard_2', path: '/dashboard' },
    { name: 'Metas de Ahorro', icon: 'savings', path: '/dashboard/goals' },
    { name: 'Presupuesto', icon: 'account_balance_wallet', path: '/dashboard/budget' },
    { name: 'Facturas Recurrentes', icon: 'receipt_long', path: '/dashboard/bills' },
    {
      name: 'Grupos',
      icon: 'group',
      path: '/dashboard/groups',
      badge: pendingRequestsCount.value || undefined
    },
    { name: 'Analitica', icon: 'analytics', path: '/dashboard/analytics' },
    { name: 'Transacciones', icon: 'swap_vertical_circle', path: '/dashboard/transactions' },
    { name: 'Cuentas', icon: 'account_balance', path: '/dashboard/accounts' },
    { name: 'Módulos', icon: 'view_module', className: 'nav-item--disabled' }
  ])

  const settingsItems: Omit<MenuItem, 'isActive'>[] = [
    { name: 'Configuración', icon: 'settings', path: '/dashboard/settings' }
  ]

  const isAdmin = computed(
    () => authStore.user?.role === 'admin' || authStore.user?.role === 'super_admin'
  )
  const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin')

  const adminNavItems = computed<Omit<MenuItem, 'isActive'>[]>(() => {
    const items: Omit<MenuItem, 'isActive'>[] = [
      { name: 'Dashboard Admin', icon: 'space_dashboard', path: '/admin' },
      { name: 'Usuarios', icon: 'people', path: '/admin/users' },
      { name: 'Planes', icon: 'card_membership', path: '/admin/plans' },
      { name: 'Categorías', icon: 'category', path: '/admin/categories' },
      { name: 'Comunicaciones', icon: 'campaign', path: '/admin/communications' },
      { name: 'Configuración', icon: 'settings', path: '/admin/config' }
    ]
    if (isSuperAdmin.value) {
      items.push({ name: 'Auditoría', icon: 'shield', path: '/admin/audit' })
    }
    return items
  })

  const mainMenuItems = computed<MenuItem[]>(() =>
    userMenuItems.value.map(item => ({
      ...item,
      isActive: item.path ? isActiveRoute(item.path, route.path) : false
    }))
  )

  const settingsMenuItems = computed<MenuItem[]>(() =>
    settingsItems.map(item => ({
      ...item,
      isActive: isActiveRoute(item.path ?? '', route.path)
    }))
  )

  const adminMenuItems = computed<MenuItem[]>(() =>
    adminNavItems.value.map(item => ({
      ...item,
      isActive: isActiveRoute(item.path ?? '', route.path)
    }))
  )

  const isActiveRoute = (itemPath: string, currentPath: string): boolean => {
    if (currentPath === itemPath) return true

    // Root paths only match themselves (with or without trailing slash)
    if (itemPath === '/dashboard' || itemPath === '/admin') {
      return currentPath === itemPath + '/'
    }

    if (currentPath.startsWith(itemPath)) {
      const remainder = currentPath.slice(itemPath.length)
      return remainder === '' || remainder.startsWith('/')
    }

    return false
  }
</script>

<template>
  <aside class="dashboard-sidebar">
    <div class="dashboard-sidebar__header">
      <AppLogo :class-name="'dark:text-white'" :show-text="!isCollapsed" />
    </div>
    <nav class="dashboard-sidebar__nav">
      <Transition name="sidebar-mode" mode="out-in">
        <div v-if="!isAdminMode || !isAdmin" key="user" class="dashboard-sidebar__nav-group">
          <NavigationSection
            title="MENÚ PRINCIPAL"
            :items="mainMenuItems"
            :collapsed="isCollapsed"
            @navigate="handleNavigate"
          />
          <NavigationSection
            title="CONFIGURACIÓN"
            :items="settingsMenuItems"
            :collapsed="isCollapsed"
            @navigate="handleNavigate"
          />
        </div>
        <div v-else key="admin" class="dashboard-sidebar__nav-group">
          <NavigationSection
            title="ADMINISTRACIÓN"
            :items="adminMenuItems"
            :collapsed="isCollapsed"
            @navigate="handleNavigate"
          />
        </div>
      </Transition>
    </nav>
    <div class="dashboard-sidebar__footer">
      <div v-if="isAdmin" class="dashboard-sidebar__mode-toggle">
        <span v-if="!isCollapsed" class="dashboard-sidebar__mode-label">
          {{ isAdminMode ? 'Modo Admin' : 'Modo Usuario' }}
        </span>
        <button
          type="button"
          role="switch"
          :aria-checked="isAdminMode"
          class="mode-switch"
          :class="{ 'mode-switch--on': isAdminMode }"
          @click="handleToggle"
        >
          <span class="mode-switch__thumb" />
        </button>
      </div>
      <div class="dashboard-sidebar__toggle">
        <AppVersion v-if="!isCollapsed" class="dashboard-sidebar__version" size="xs" />
        <Button
          :icon="isCollapsed ? 'chevron_right' : 'chevron_left'"
          variant="primary"
          size="sm"
          :icon-only="true"
          @click="toggleCollapse"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="postcss">
  .dashboard-sidebar {
    @apply flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 shadow-lg transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:shadow-2xl;
  }
  .dashboard-sidebar__header {
    @apply z-10 max-h-[56px] border-neutral-200 px-4 py-2 dark:border-neutral-700;
  }
  .dashboard-sidebar__nav {
    @apply flex-1 gap-2 px-3 py-2 2xl:px-4 2xl:py-4;
  }
  .dashboard-sidebar__nav-group {
    @apply flex flex-col gap-2;
  }
  .dashboard-sidebar__footer {
    @apply px-4 pb-2;
  }
  .dashboard-sidebar__toggle {
    @apply mt-2 flex justify-between;
  }
  .dashboard-sidebar__mode-toggle {
    @apply mb-2 flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700;
  }
  .dashboard-sidebar__mode-label {
    @apply text-xs font-medium text-neutral-600 dark:text-neutral-400;
  }
  .mode-switch {
    @apply relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-neutral-300 transition-colors duration-200 focus:outline-none dark:bg-neutral-600;
  }
  .mode-switch--on {
    @apply bg-primary-600 dark:bg-primary-500;
  }
  .mode-switch__thumb {
    @apply pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200;
  }
  .mode-switch--on .mode-switch__thumb {
    @apply translate-x-5;
  }

  .dashboard-sidebar__version {
    @apply ml-1 font-bold text-primary-900 dark:text-primary-400;
  }

  .sidebar-mode-enter-active,
  .sidebar-mode-leave-active {
    @apply transition-all duration-200;
  }
  .sidebar-mode-enter-from,
  .sidebar-mode-leave-to {
    @apply opacity-0;
  }
</style>
