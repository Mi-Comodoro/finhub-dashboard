<script setup lang="ts">
  import Icon from '@/components/atoms/icons/Icon.vue'
  import { useNotificationsApplication } from '@/composables/application/useNotificationsApplication'
  import { useNotificationsStore } from '@/stores/notifications.store'

  const DROPDOWN_LIMIT = 8

  const router = useRouter()
  const notificationsStore = useNotificationsStore()
  const { handleMarkAllRead, handleMarkRead } = useNotificationsApplication()

  const notifications = computed(() => notificationsStore.notifications)
  const unreadCount = computed(() => notificationsStore.unreadCount)
  const visibleNotifications = computed(() => notifications.value.slice(0, DROPDOWN_LIMIT))
  const hiddenCount = computed(() => Math.max(0, notifications.value.length - DROPDOWN_LIMIT))

  const showDropdown = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)
  const pulseBadge = ref(false)

  watch(unreadCount, (newVal, oldVal) => {
    if (newVal > oldVal) {
      pulseBadge.value = true
      setTimeout(() => (pulseBadge.value = false), 1500)
    }
  })

  const TYPE_LABELS: Record<string, string> = {
    friend_request: 'Solicitud de amistad',
    friend_accepted: 'Solicitud aceptada',
    friend_rejected: 'Solicitud rechazada',
    announcement: 'Anuncio'
  }

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const onNotificationClick = async (id: string) => {
    await handleMarkRead(id)
    showDropdown.value = false
    router.push('/dashboard/notifications')
  }

  const onMarkAllRead = async () => {
    await handleMarkAllRead()
  }

  const goToAll = () => {
    showDropdown.value = false
    router.push('/dashboard/notifications')
  }

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null
    if (dropdownRef.value && target && !dropdownRef.value.contains(target)) {
      showDropdown.value = false
    }
  }

  const formatTime = (date: string) =>
    new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
      Math.round((new Date(date).getTime() - Date.now()) / 60000),
      'minutes'
    )

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <div ref="dropdownRef" class="notification-center">
    <span class="notification-center__trigger" title="Notificaciones" @click.stop="toggleDropdown">
      <Icon name="notifications_none" size="md" />
      <span
        v-if="unreadCount > 0"
        :class="['notification-center__badge', { 'notification-center__badge--pulse': pulseBadge }]"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </span>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showDropdown" class="notification-center__dropdown">
        <div class="notification-center__dropdown-header">
          <span class="notification-center__dropdown-title">
            {{ unreadCount > 0 ? `${unreadCount} sin leer` : 'Notificaciones' }}
          </span>
          <div class="notification-center__dropdown-actions">
            <button
              v-if="unreadCount > 0"
              class="notification-center__mark-all"
              @click="onMarkAllRead"
            >
              Marcar todas
            </button>
            <button class="notification-center__see-all" @click="goToAll">Ver todas</button>
          </div>
        </div>

        <div class="notification-center__dropdown-list">
          <div v-if="notifications.length === 0" class="notification-center__dropdown-empty">
            <span class="material-symbols-outlined notification-center__empty-icon">
              notifications_none
            </span>
            <span>Sin notificaciones</span>
          </div>

          <button
            v-for="notification in visibleNotifications"
            :key="notification.id"
            :class="[
              'notification-center__dropdown-item',
              !notification.isRead && 'notification-center__dropdown-item--unread'
            ]"
            type="button"
            @click="onNotificationClick(notification.id)"
          >
            <div class="notification-center__dropdown-item-header">
              <span class="notification-center__dropdown-item-type">
                {{ TYPE_LABELS[notification.type] ?? notification.type }}
              </span>
              <span class="notification-center__dropdown-item-time">
                {{ formatTime(notification.createdAt) }}
              </span>
            </div>
            <div class="notification-center__dropdown-item-message">
              {{
                notification.type === 'announcement'
                  ? (notification.payload.title ?? '')
                  : notification.payload.senderHandle
                    ? `@${notification.payload.senderHandle}`
                    : (notification.payload.senderDisplayName ?? '')
              }}
            </div>
          </button>

          <button
            v-if="hiddenCount > 0"
            class="notification-center__see-all-bottom"
            @click="goToAll"
          >
            Ver {{ hiddenCount }} más
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
    @apply relative flex cursor-pointer items-center justify-center rounded-md p-2 text-neutral-600 transition-colors hover:text-neutral-900;
    @apply dark:text-neutral-400 dark:hover:text-white;
  }

  .notification-center__badge {
    @apply absolute -top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white;
  }

  .notification-center__badge--pulse {
    animation: badge-pulse 1.5s ease-in-out;
  }

  @keyframes badge-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.4);
    }
    60% {
      transform: scale(1.1);
    }
  }

  .notification-center__dropdown {
    @apply absolute right-0 top-10 z-50 w-80 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5;
    @apply dark:bg-neutral-700;
  }

  .notification-center__dropdown-header {
    @apply flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-600;
  }

  .notification-center__dropdown-title {
    @apply text-sm font-medium text-neutral-900 dark:text-white;
  }

  .notification-center__dropdown-actions {
    @apply flex items-center gap-2;
  }

  .notification-center__mark-all {
    @apply text-xs text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200;
  }

  .notification-center__see-all {
    @apply text-xs font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400;
  }

  .notification-center__see-all-bottom {
    @apply w-full py-2.5 text-center text-xs font-medium text-primary-600 hover:bg-neutral-50 dark:text-primary-400 dark:hover:bg-neutral-600;
  }

  .notification-center__dropdown-list {
    @apply max-h-80 overflow-y-auto;
  }

  .notification-center__dropdown-empty {
    @apply flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400;
  }

  .notification-center__dropdown-item {
    @apply w-full border-b border-neutral-100 px-4 py-3 text-left transition-colors hover:bg-neutral-50;
    @apply dark:border-neutral-600 dark:hover:bg-neutral-600;
  }

  .notification-center__dropdown-item--unread {
    @apply bg-primary-50 dark:bg-primary-900/20;
  }

  .notification-center__dropdown-item-header {
    @apply flex items-center justify-between;
  }

  .notification-center__dropdown-item-type {
    @apply text-xs font-semibold text-neutral-700 dark:text-neutral-300;
  }

  .notification-center__dropdown-item-time {
    @apply text-xs text-neutral-400 dark:text-neutral-500;
  }

  .notification-center__dropdown-item-message {
    @apply mt-0.5 line-clamp-2 text-left text-xs text-neutral-500 dark:text-neutral-400;
  }

  .notification-center__empty-icon {
    @apply text-3xl text-neutral-300 dark:text-neutral-600;
  }
</style>
