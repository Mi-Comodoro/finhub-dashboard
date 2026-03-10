<script setup lang="ts">
  import { Icon } from '@/components/atoms'

  interface Notification {
    id: number
    title: string
    message: string
    time: string
    read?: boolean
  }

  interface NotificationCenterProps {
    /** List of notifications */
    notifications?: Notification[]
    /** Custom classes */
    className?: string
  }

  const props = withDefaults(defineProps<NotificationCenterProps>(), {
    notifications: () => [],
    className: ''
  })

  // State
  const showDropdown = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)

  // Computed
  const unreadCount = computed(() => props.notifications.filter(n => !n.read).length)

  // Methods
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null

    if (dropdownRef.value && target && !dropdownRef.value.contains(target)) {
      showDropdown.value = false
    }
  }

  // Close dropdown when clicking outside
  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <div ref="dropdownRef" class="notification-center" :class="className">
    <!-- Notification trigger -->
    <span class="notification-center__trigger" title="Notificaciones" @click="toggleDropdown">
      <Icon name="notifications_none" size="md" />
      <!-- Badge with count -->
      <span v-if="unreadCount > 0" class="notification-center__badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </span>

    <!-- Notifications dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showDropdown" class="notification-center__dropdown">
        <!-- Header -->
        <div class="notification-center__dropdown-header">
          <div class="notification-center__dropdown-title">
            Notificaciones ({{ notifications.length }})
          </div>
        </div>

        <!-- Notifications list -->
        <div class="notification-center__dropdown-list">
          <div v-if="notifications.length === 0" class="notification-center__dropdown-empty">
            No hay notificaciones
          </div>

          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-center__dropdown-item"
          >
            <div class="notification-center__dropdown-item-title">
              {{ notification.title }}
            </div>
            <div class="notification-center__dropdown-item-message">
              {{ notification.message }}
            </div>
            <div class="notification-center__dropdown-item-time">
              {{ notification.time }}
            </div>
          </div>
        </div>

        <!-- Footer (opcional) -->
        <div class="notification-center__dropdown-footer">
          <button class="notification-center__dropdown-footer-btn">
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
<style lang="postcss" scoped>
  .notification-center {
    @apply relative;
  }
  .notification-center__trigger {
    @apply relative flex cursor-pointer items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white;
  }
  .notification-center__badge {
    @apply absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white;
  }
  .notification-center__dropdown {
    @apply absolute right-0 top-10 z-50 w-80 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700;
  }
  .notification-center__dropdown-header {
    @apply border-b border-gray-200 px-4 py-2 dark:border-gray-600;
  }
  .notification-center__dropdown-title {
    @apply text-sm font-medium text-gray-900 dark:text-white;
  }
  .notification-center__dropdown-list {
    @apply max-h-64 overflow-y-auto;
  }
  .notification-center__dropdown-empty {
    @apply px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400;
  }
  .notification-center__dropdown-item {
    @apply border-b border-gray-100 px-4 py-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600;
  }
  .notification-center__dropdown-item-title {
    @apply text-sm font-medium text-gray-900 dark:text-white;
  }
  .notification-center__dropdown-item-message {
    @apply text-xs text-gray-500 dark:text-gray-400;
  }
  .notification-center__dropdown-item-time {
    @apply mt-1 text-xs text-gray-400 dark:text-gray-500;
  }
  .notification-center__dropdown-footer {
    @apply border-t border-gray-200 p-2 text-center dark:border-gray-600;
  }
  .notification-center__dropdown-footer-btn {
    @apply text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300;
  }
</style>
