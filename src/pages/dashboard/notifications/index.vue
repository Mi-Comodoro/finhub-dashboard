<script setup lang="ts">
  import { useFriendshipsApi } from '@/composables/api/useFriendshipsApi'
  import { useNotificationsApplication } from '@/composables/application/useNotificationsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { AppNotification } from '@/types/notifications.types'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth'],
    title: 'Notificaciones',
    breadcrumb: 'Notificaciones'
  })

  const PAGE_SIZE = 15

  const { loadNotificationsPaginated, handleMarkRead, handleDeleteNotification, handleDeleteAll } =
    useNotificationsApplication()
  const { acceptRequest, rejectRequest } = useFriendshipsApi()
  const { success: successToast, error: errorToast } = useFeedback()

  const items = ref<AppNotification[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const isLoading = ref(true)
  const pendingAction = ref<string | null>(null)
  const selectedNotification = ref<AppNotification | null>(null)
  const showModal = ref(false)

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
  const unreadCount = computed(() => items.value.filter(n => !n.isRead).length)

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

  const getShortMessage = (n: AppNotification) => {
    if (n.type === 'announcement') return n.payload.title ?? 'Nuevo anuncio'
    const action: Record<string, string> = {
      friend_request: 'quiere ser tu amigo',
      friend_accepted: 'aceptó tu solicitud de amistad',
      friend_rejected: 'rechazó tu solicitud de amistad'
    }
    if (n.payload.senderHandle) return `@${n.payload.senderHandle} ${action[n.type] ?? ''}`
    return n.payload.senderDisplayName ?? 'Notificación'
  }

  const fetchPage = async (page: number) => {
    isLoading.value = true
    const { items: data, total: count } = await loadNotificationsPaginated(page, PAGE_SIZE)
    items.value = data
    total.value = count
    currentPage.value = page
    isLoading.value = false
  }

  const openNotification = async (n: AppNotification) => {
    selectedNotification.value = n
    showModal.value = true
    if (!n.isRead) {
      await handleMarkRead(n.id)
      const found = items.value.find(item => item.id === n.id)
      if (found) found.isRead = true
    }
  }

  const closeModal = () => {
    showModal.value = false
    selectedNotification.value = null
    pendingAction.value = null
  }

  const deleteOne = async (n: AppNotification) => {
    const { success } = await handleDeleteNotification(n.id)
    if (success) {
      successToast('Eliminada', 'Notificación eliminada')
      if (items.value.length === 1 && currentPage.value > 1) {
        await fetchPage(currentPage.value - 1)
      } else {
        await fetchPage(currentPage.value)
      }
      if (selectedNotification.value?.id === n.id) closeModal()
    } else {
      errorToast('Error', 'No se pudo eliminar la notificación')
    }
  }

  const deleteAll = async () => {
    const { success } = await handleDeleteAll()
    if (success) {
      items.value = []
      total.value = 0
      currentPage.value = 1
      closeModal()
      successToast('Listo', 'Todas las notificaciones eliminadas')
    } else {
      errorToast('Error', 'No se pudieron eliminar las notificaciones')
    }
  }

  const onAccept = async (n: AppNotification) => {
    if (!n.payload.senderId) return
    pendingAction.value = n.id
    try {
      await acceptRequest(n.payload.senderId)
      await handleMarkRead(n.id)
      successToast('Solicitud aceptada', `Ahora son amigos con @${n.payload.senderHandle}`)
      closeModal()
      await fetchPage(currentPage.value)
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
      closeModal()
      await fetchPage(currentPage.value)
    } catch {
      errorToast('Error', 'No se pudo rechazar la solicitud')
    } finally {
      pendingAction.value = null
    }
  }

  onMounted(() => fetchPage(1))
</script>

<template>
  <div class="notifications-page">
    <!-- Header -->
    <div class="notifications-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Notificaciones</Heading>
        <Text size="xs" color="muted">
          <template v-if="total > 0">
            {{ total }} notificaciones{{ unreadCount > 0 ? ` · ${unreadCount} sin leer` : '' }}
          </template>
          <template v-else>Todo al día</template>
        </Text>
      </div>
      <Button v-if="total > 0" variant="ghost" size="sm" icon="delete_sweep" @click="deleteAll">
        Eliminar todas
      </Button>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="notifications-page__list">
      <div v-for="n in 5" :key="n" class="notifications-page__skeleton" />
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="notifications-page__empty">
      <span class="material-symbols-outlined notifications-page__empty-icon">
        notifications_none
      </span>
      <Heading level="h3" size="lg" weight="semibold">Sin notificaciones</Heading>
      <Text size="sm" color="muted">Aquí aparecerán tus alertas, anuncios y solicitudes</Text>
    </div>

    <!-- List -->
    <div v-else class="notifications-page__list">
      <button
        v-for="notification in items"
        :key="notification.id"
        :class="[
          'notifications-page__item',
          !notification.isRead && 'notifications-page__item--unread'
        ]"
        type="button"
        @click="openNotification(notification)"
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
            <span class="notifications-page__type">{{ getConfig(notification.type).label }}</span>
            <span v-if="!notification.isRead" class="notifications-page__unread-dot" />
          </div>
          <p class="notifications-page__message">{{ getShortMessage(notification) }}</p>
        </div>

        <!-- Meta -->
        <div class="notifications-page__meta">
          <span class="notifications-page__date">{{ formatDate(notification.createdAt) }}</span>
          <button
            class="notifications-page__delete-btn"
            type="button"
            @click.stop="deleteOne(notification)"
          >
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="notifications-page__pagination">
      <Button
        variant="ghost"
        size="sm"
        icon="chevron_left"
        :disabled="currentPage === 1"
        @click="fetchPage(currentPage - 1)"
      >
        Anterior
      </Button>
      <span class="notifications-page__page-info">{{ currentPage }} / {{ totalPages }}</span>
      <Button
        variant="ghost"
        size="sm"
        icon="chevron_right"
        icon-position="right"
        :disabled="currentPage === totalPages"
        @click="fetchPage(currentPage + 1)"
      >
        Siguiente
      </Button>
    </div>

    <!-- Detail Modal -->
    <ModalWizard :show="showModal">
      <div v-if="selectedNotification" class="notif-modal">
        <!-- Fixed header -->
        <div class="notif-modal__header">
          <div
            :class="[
              'notif-modal__icon-wrap',
              `notif-modal__icon-wrap--${selectedNotification.type.split('_')[0]}`
            ]"
          >
            <span class="material-symbols-outlined notif-modal__icon">
              {{ getConfig(selectedNotification.type).icon }}
            </span>
          </div>
          <div class="notif-modal__header-text">
            <span class="notif-modal__type">{{ getConfig(selectedNotification.type).label }}</span>
            <span class="notif-modal__date">{{ formatDate(selectedNotification.createdAt) }}</span>
          </div>
        </div>

        <!-- Scrollable body -->
        <div class="notif-modal__body-area">
          <template v-if="selectedNotification.type === 'announcement'">
            <p class="notif-modal__title">{{ selectedNotification.payload.title }}</p>
            <p class="notif-modal__body">{{ selectedNotification.payload.body }}</p>
          </template>

          <template v-else-if="selectedNotification.type === 'friend_request'">
            <p class="notif-modal__title">
              <strong>@{{ selectedNotification.payload.senderHandle }}</strong>
              quiere ser tu amigo
            </p>
            <div class="notif-modal__actions">
              <Button
                variant="primary"
                size="sm"
                :disabled="pendingAction === selectedNotification.id"
                @click="onAccept(selectedNotification)"
              >
                Aceptar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :disabled="pendingAction === selectedNotification.id"
                @click="onReject(selectedNotification)"
              >
                Rechazar
              </Button>
            </div>
          </template>

          <template v-else-if="selectedNotification.type === 'friend_accepted'">
            <p class="notif-modal__title">
              <strong>@{{ selectedNotification.payload.senderHandle }}</strong>
              aceptó tu solicitud de amistad
            </p>
          </template>

          <template v-else-if="selectedNotification.type === 'friend_rejected'">
            <p class="notif-modal__title">
              <strong>@{{ selectedNotification.payload.senderHandle }}</strong>
              rechazó tu solicitud de amistad
            </p>
          </template>

          <template v-else>
            <p class="notif-modal__title">
              {{
                selectedNotification.payload.senderDisplayName ??
                selectedNotification.payload.senderHandle ??
                'Notificación'
              }}
            </p>
          </template>
        </div>

        <!-- Fixed footer -->
        <div class="notif-modal__footer">
          <Button variant="ghost" size="sm" @click="closeModal">Cerrar</Button>
          <Button variant="ghost" size="sm" icon="delete" @click="deleteOne(selectedNotification)">
            Eliminar
          </Button>
        </div>
      </div>
    </ModalWizard>
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
    @apply h-14 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800;
  }

  .notifications-page__empty {
    @apply flex flex-col items-center gap-3 py-20 text-center;
  }

  .notifications-page__empty-icon {
    @apply text-6xl text-neutral-300 dark:text-neutral-600;
  }

  /* Compact item */
  .notifications-page__item {
    @apply flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:bg-neutral-50;
    @apply dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700;
  }

  .notifications-page__item--unread {
    @apply border-primary-200 bg-primary-50/40 dark:border-primary-900 dark:bg-primary-900/10;
  }

  /* Icon */
  .notifications-page__icon-wrap {
    @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full;
  }

  .notifications-page__icon-wrap--announcement {
    @apply bg-secondary-100 dark:bg-secondary-900/30;
  }

  .notifications-page__icon-wrap--friend {
    @apply bg-success-100 dark:bg-success-900/30;
  }

  .notifications-page__icon {
    @apply text-lg;
  }

  .notifications-page__icon-wrap--announcement .notifications-page__icon {
    @apply text-secondary-600 dark:text-secondary-400;
  }

  .notifications-page__icon-wrap--friend .notifications-page__icon {
    @apply text-success-600 dark:text-success-400;
  }

  /* Content */
  .notifications-page__content {
    @apply flex min-w-0 flex-1 flex-col gap-0.5;
  }

  .notifications-page__item-header {
    @apply flex items-center gap-1.5;
  }

  .notifications-page__type {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400;
  }

  .notifications-page__unread-dot {
    @apply h-1.5 w-1.5 rounded-full bg-primary-500;
  }

  .notifications-page__message {
    @apply truncate text-sm text-neutral-800 dark:text-neutral-200;
  }

  /* Meta */
  .notifications-page__meta {
    @apply flex shrink-0 flex-col items-end gap-1;
  }

  .notifications-page__date {
    @apply whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-500;
  }

  .notifications-page__delete-btn {
    @apply flex h-6 w-6 items-center justify-center rounded text-neutral-300 transition-colors hover:bg-danger-50 hover:text-danger-500;
    @apply dark:text-neutral-600 dark:hover:bg-danger-900/20 dark:hover:text-danger-400;
  }

  .notifications-page__delete-btn .material-symbols-outlined {
    @apply text-base;
  }

  /* Pagination */
  .notifications-page__pagination {
    @apply flex items-center justify-center gap-4 py-2;
  }

  .notifications-page__page-info {
    @apply text-sm text-neutral-500 dark:text-neutral-400;
  }

  /* Detail modal — header y footer fijos, body con scroll */
  .notif-modal {
    @apply flex flex-col;
    min-height: 360px;
    max-height: calc(90vh - 8rem);
  }

  .notif-modal__header {
    @apply flex shrink-0 items-center gap-3 pb-4;
  }

  .notif-modal__icon-wrap {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-full;
  }

  .notif-modal__icon-wrap--announcement {
    @apply bg-secondary-100 dark:bg-secondary-900/30;
  }

  .notif-modal__icon-wrap--friend {
    @apply bg-success-100 dark:bg-success-900/30;
  }

  .notif-modal__icon {
    @apply text-xl;
  }

  .notif-modal__icon-wrap--announcement .notif-modal__icon {
    @apply text-secondary-600 dark:text-secondary-400;
  }

  .notif-modal__icon-wrap--friend .notif-modal__icon {
    @apply text-success-600 dark:text-success-400;
  }

  .notif-modal__header-text {
    @apply flex flex-col gap-0.5;
  }

  .notif-modal__type {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400;
  }

  .notif-modal__date {
    @apply text-xs text-neutral-400 dark:text-neutral-500;
  }

  .notif-modal__body-area {
    @apply flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-2;
  }

  .notif-modal__title {
    @apply text-sm leading-relaxed text-neutral-900 dark:text-neutral-100;
  }

  .notif-modal__body {
    @apply whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400;
  }

  .notif-modal__actions {
    @apply flex gap-2 pt-1;
  }

  .notif-modal__footer {
    @apply flex shrink-0 items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-700;
  }
</style>
