<script setup lang="ts">
  import { useFriendshipsApi } from '@/composables/api/useFriendshipsApi'
  import { useNotificationsApplication } from '@/composables/application/useNotificationsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useNotificationsStore } from '@/stores/notifications.store'
  import type { AppNotification } from '@/types/notifications.types'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth'],
    title: 'Notificaciones',
    breadcrumb: 'Notificaciones'
  })

  const notificationsStore = useNotificationsStore()
  const { loadNotifications, handleMarkAllRead, handleMarkRead } = useNotificationsApplication()
  const { acceptRequest, rejectRequest } = useFriendshipsApi()
  const { success: successToast, error: errorToast } = useFeedback()

  const notifications = computed(() => notificationsStore.notifications)
  const unreadCount = computed(() => notificationsStore.unreadCount)
  const isLoading = ref(true)
  const pendingAction = ref<string | null>(null)

  const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
    announcement: { icon: 'campaign', label: 'Anuncio' },
    friend_request: { icon: 'person_add', label: 'Solicitud de amistad' },
    friend_accepted: { icon: 'how_to_reg', label: 'Solicitud aceptada' },
    friend_rejected: { icon: 'person_off', label: 'Solicitud rechazada' }
  }

  const getConfig = (type: string) => TYPE_CONFIG[type] ?? { icon: 'notifications', label: type }

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso))

  const markRead = async (n: AppNotification) => {
    if (!n.isRead) await handleMarkRead(n.id)
  }

  const markAllRead = async () => {
    await handleMarkAllRead()
    successToast('Listo', 'Todas las notificaciones marcadas como leídas')
  }

  const onAccept = async (n: AppNotification) => {
    if (!n.payload.senderId) return
    pendingAction.value = n.id
    try {
      await acceptRequest(n.payload.senderId)
      await handleMarkRead(n.id)
      successToast('Solicitud aceptada', `Ahora son amigos con @${n.payload.senderHandle}`)
      await loadNotifications()
    } catch {
      errorToast('Error', 'No se pudo aceptar la solicitud')
    } finally {
      pendingAction.value = null
    }
  }

  const onReject = async (n: AppNotification) => {
    if (!n.payload.senderId) return
    pendingAction.value = n.id
    try {
      await rejectRequest(n.payload.senderId)
      await handleMarkRead(n.id)
      successToast('Solicitud rechazada', `Rechazaste la solicitud de @${n.payload.senderHandle}`)
      await loadNotifications()
    } catch {
      errorToast('Error', 'No se pudo rechazar la solicitud')
    } finally {
      pendingAction.value = null
    }
  }

  onMounted(async () => {
    await loadNotifications()
    isLoading.value = false
  })
</script>

<template>
  <div class="notifications-page">
    <div class="notifications-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Notificaciones</Heading>
        <Text size="xs" color="muted">
          {{ unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día' }}
        </Text>
      </div>
      <Button v-if="unreadCount > 0" variant="ghost" size="sm" @click="markAllRead">
        Marcar todas como leídas
      </Button>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="notifications-page__list">
      <div v-for="n in 4" :key="n" class="notifications-page__skeleton" />
    </div>

    <!-- Empty -->
    <div v-else-if="!notifications.length" class="notifications-page__empty">
      <span class="material-symbols-outlined notifications-page__empty-icon">
        notifications_none
      </span>
      <Heading level="h3" size="lg" weight="semibold">Sin notificaciones</Heading>
      <Text size="sm" color="muted">Aquí aparecerán tus alertas, anuncios y solicitudes</Text>
    </div>

    <!-- List -->
    <div v-else class="notifications-page__list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notifications-page__item',
          !notification.isRead && 'notifications-page__item--unread'
        ]"
        @click="markRead(notification)"
      >
        <!-- Icon -->
        <div
          :class="[
            'notifications-page__icon-wrap',
            `notifications-page__icon-wrap--${notification.type.split('_')[0]}`
          ]"
        >
          <span class="material-symbols-outlined notifications-page__icon">
            {{ getConfig(notification.type).icon }}
          </span>
        </div>

        <!-- Content -->
        <div class="notifications-page__content">
          <div class="notifications-page__item-header">
            <span class="notifications-page__type">
              {{ getConfig(notification.type).label }}
            </span>
            <span
              v-if="!notification.isRead"
              class="notifications-page__unread-dot"
              aria-label="Sin leer"
            />
          </div>

          <!-- Announcement -->
          <template v-if="notification.type === 'announcement'">
            <p class="notifications-page__title">{{ notification.payload.title }}</p>
            <p class="notifications-page__body">{{ notification.payload.body }}</p>
          </template>

          <!-- Friend request -->
          <template v-else-if="notification.type === 'friend_request'">
            <p class="notifications-page__title">
              <strong>@{{ notification.payload.senderHandle }}</strong>
              quiere ser tu amigo
            </p>
            <div class="notifications-page__actions" @click.stop>
              <Button
                variant="primary"
                size="sm"
                :disabled="pendingAction === notification.id"
                @click="onAccept(notification)"
              >
                Aceptar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :disabled="pendingAction === notification.id"
                @click="onReject(notification)"
              >
                Rechazar
              </Button>
            </div>
          </template>

          <!-- Friend accepted -->
          <template v-else-if="notification.type === 'friend_accepted'">
            <p class="notifications-page__title">
              <strong>@{{ notification.payload.senderHandle }}</strong>
              aceptó tu solicitud de amistad
            </p>
          </template>

          <!-- Friend rejected -->
          <template v-else-if="notification.type === 'friend_rejected'">
            <p class="notifications-page__title">
              <strong>@{{ notification.payload.senderHandle }}</strong>
              rechazó tu solicitud de amistad
            </p>
          </template>

          <!-- Fallback -->
          <template v-else>
            <p class="notifications-page__title">
              {{
                notification.payload.senderDisplayName ??
                notification.payload.senderHandle ??
                'Notificación'
              }}
            </p>
          </template>

          <span class="notifications-page__date">{{ formatDate(notification.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .notifications-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .notifications-page__header {
    @apply flex items-center justify-between;
  }

  .notifications-page__list {
    @apply flex flex-col gap-2;
  }

  .notifications-page__skeleton {
    @apply h-20 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800;
  }

  .notifications-page__empty {
    @apply flex flex-col items-center gap-3 py-20 text-center;
  }

  .notifications-page__empty-icon {
    @apply text-6xl text-neutral-300 dark:text-neutral-600;
  }

  /* Item */
  .notifications-page__item {
    @apply flex cursor-pointer gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700;
  }

  .notifications-page__item--unread {
    @apply border-primary-200 bg-primary-50/40 dark:border-primary-900 dark:bg-primary-900/10;
  }

  /* Icon */
  .notifications-page__icon-wrap {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-full;
  }

  .notifications-page__icon-wrap--announcement {
    @apply bg-secondary-100 dark:bg-secondary-900/30;
  }

  .notifications-page__icon-wrap--friend {
    @apply bg-success-100 dark:bg-success-900/30;
  }

  .notifications-page__icon {
    @apply text-xl;
  }

  .notifications-page__icon-wrap--announcement .notifications-page__icon {
    @apply text-secondary-600 dark:text-secondary-400;
  }

  .notifications-page__icon-wrap--friend .notifications-page__icon {
    @apply text-success-600 dark:text-success-400;
  }

  /* Content */
  .notifications-page__content {
    @apply flex flex-1 flex-col gap-1;
  }

  .notifications-page__item-header {
    @apply flex items-center gap-2;
  }

  .notifications-page__type {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400;
  }

  .notifications-page__unread-dot {
    @apply h-2 w-2 rounded-full bg-primary-500;
  }

  .notifications-page__title {
    @apply text-sm text-neutral-900 dark:text-neutral-100;
  }

  .notifications-page__body {
    @apply text-sm leading-relaxed text-neutral-600 dark:text-neutral-400;
  }

  .notifications-page__date {
    @apply mt-1 text-xs text-neutral-400 dark:text-neutral-500;
  }

  .notifications-page__actions {
    @apply mt-2 flex gap-2;
  }
</style>
