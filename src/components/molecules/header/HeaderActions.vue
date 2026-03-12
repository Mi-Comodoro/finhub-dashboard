<script setup lang="ts">
  import { Icon, ThemeToggle, UserAvatar } from '@/components/atoms'
  import { NotificationCenter } from '@/components/molecules'
  import { useAuthStore } from '~/stores/auth.store'

  import type { HeaderActionsProps } from './types/header-actions.types'

  withDefaults(defineProps<HeaderActionsProps>(), {
    className: ''
  })

  const authStore = useAuthStore()
  const user = computed(() => authStore.user)
  // User dropdown state
  const showUserDropdown = ref(false)
  const userDropdownRef = ref<HTMLElement | null>(null)

  // Mock notifications data
  const notifications = ref([
    {
      id: 1,
      title: 'Nueva transacción',
      message: 'Se registró un gasto de $50.000',
      time: '2 min',
      read: false
    },
    {
      id: 2,
      title: 'Meta alcanzada',
      message: 'Has completado tu meta de ahorro mensual',
      time: '1 hora',
      read: false
    },
    {
      id: 3,
      title: 'Recordatorio',
      message: 'Revisa tu presupuesto semanal',
      time: '3 horas',
      read: true
    }
  ])

  const { accountType } = useAuthStore()
  const { logout } = useAuth()
  // Logout function
  const handleLogout = async () => {
    showUserDropdown.value = false
    await logout()
    await navigateTo('/')
  }

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null

    if (userDropdownRef.value && target && !userDropdownRef.value.contains(target)) {
      showUserDropdown.value = false
    }
  }

  // Close user dropdown when clicking outside
  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <div :class="['flex items-center gap-2', className]">
    <Badge variant="secondary" size="xs" class="mr-2">{{ accountType }}</Badge>
    <!-- Theme toggle -->
    <span class="flex items-center justify-center rounded-md">
      <ThemeToggle size="md" />
    </span>

    <!-- Notification Center -->
    <NotificationCenter :notifications="notifications" />

    <!-- User avatar with dropdown -->
    <div v-if="user" ref="userDropdownRef" class="relative">
      <button
        :title="user.displayName || user.email"
        class="flex items-center rounded-md p-1 transition-opacity hover:opacity-80"
        @click="showUserDropdown = !showUserDropdown"
      >
        <UserAvatar :name="user.displayName || 'Usuario'" :avatar="user.avatar" size="sm" />
      </button>

      <!-- User dropdown menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showUserDropdown"
          class="absolute right-0 top-10 z-50 w-64 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700"
        >
          <!-- User info header -->
          <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-600">
            <div class="flex items-center gap-3">
              <UserAvatar :name="user.displayName || 'Usuario'" :avatar="user.avatar" size="md" />
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ user.displayName }}
                </div>
                <div class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ user.email }}
                </div>
              </div>
            </div>
          </div>

          <!-- Menu options -->
          <div class="py-1">
            <NuxtLink
              to="/dashboard/profile/"
              class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Icon name="person" size="sm" class="mr-3" />
              Mi perfil
            </NuxtLink>

            <NuxtLink
              to="/dashboard/settings"
              class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <Icon name="settings" size="sm" class="mr-3" />
              Configuración
            </NuxtLink>
          </div>

          <!-- Logout option -->
          <div class="border-t border-gray-200 py-1 dark:border-gray-600">
            <button
              class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              @click="handleLogout"
            >
              <Icon name="logout" size="sm" class="mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
