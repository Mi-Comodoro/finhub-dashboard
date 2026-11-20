<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'
  import { useTimezone } from '@/composables/useTimezone'
  import type { AnnouncementSegment } from '@/types/domain'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Comunicaciones',
    breadcrumb: 'Comunicaciones'
  })

  const {
    announcements,
    isLoadingAnnouncements,
    fetchAnnouncements,
    sendAnnouncement,
    previewAnnouncementCount
  } = useAdminApplication()

  const { show: showToast } = useToast()
  const { formatDate } = useTimezone()

  const segmentOptions: { value: AnnouncementSegment; label: string }[] = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: 'free', label: 'Solo plan FREE' },
    { value: 'trial', label: 'Solo en trial' },
    { value: 'plus', label: 'Solo plan PLUS' },
    { value: 'pro', label: 'Solo plan PRO' },
    { value: 'partner', label: 'Solo plan PARTNER' }
  ]

  const segmentLabel: Record<AnnouncementSegment, string> = {
    all: 'Todos',
    free: 'FREE',
    trial: 'Trial',
    plus: 'PLUS',
    pro: 'PRO',
    partner: 'PARTNER'
  }

  const title = ref('')
  const body = ref('')
  const segment = ref<AnnouncementSegment>('all')
  const previewCount = ref<number | null>(null)
  const isLoadingPreview = ref(false)
  const showConfirmModal = ref(false)
  const isSending = ref(false)

  const loadPreview = async () => {
    isLoadingPreview.value = true
    previewCount.value = await previewAnnouncementCount(segment.value)
    isLoadingPreview.value = false
  }

  watch(segment, loadPreview)

  const openConfirm = () => {
    if (!title.value.trim() || !body.value.trim()) {
      showToast({
        title: 'Campos requeridos',
        description: 'Completa el título y el mensaje',
        type: 'error'
      })
      return
    }
    showConfirmModal.value = true
  }

  const cancelSend = () => {
    showConfirmModal.value = false
  }

  const confirmSend = async () => {
    showConfirmModal.value = false
    isSending.value = true
    const { success, recipientCount } = await sendAnnouncement({
      title: title.value.trim(),
      body: body.value.trim(),
      segment: segment.value
    })
    isSending.value = false

    if (success) {
      showToast({
        title: 'Anuncio enviado',
        description: `Anuncio enviado a ${recipientCount} usuarios`,
        type: 'success'
      })
      title.value = ''
      body.value = ''
      segment.value = 'all'
      previewCount.value = null
    } else {
      showToast({ title: 'Error', description: 'No se pudo enviar el anuncio', type: 'error' })
    }
  }

  onMounted(() => {
    fetchAnnouncements()
    loadPreview()
  })
</script>

<template>
  <div class="comms-page">
    <div class="comms-page__header">
      <Heading level="h1" size="2xl" weight="extrabold">Comunicaciones</Heading>
      <Text size="xs" color="muted">Envía anuncios segmentados a usuarios de la plataforma</Text>
    </div>

    <div class="comms-page__grid">
      <!-- Formulario -->
      <div class="comms-page__card">
        <Heading level="h3" size="lg" weight="semibold">Nuevo anuncio</Heading>

        <div class="comms-page__field">
          <label class="comms-page__label">Título *</label>
          <input
            v-model="title"
            class="comms-page__input"
            type="text"
            placeholder="Título del anuncio"
          />
        </div>

        <div class="comms-page__field">
          <label class="comms-page__label">Mensaje *</label>
          <textarea
            v-model="body"
            class="comms-page__textarea"
            rows="4"
            placeholder="Escribe el mensaje aquí..."
          />
        </div>

        <div class="comms-page__field">
          <label class="comms-page__label">Destinatarios *</label>
          <select v-model="segment" class="comms-page__select">
            <option v-for="opt in segmentOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="comms-page__preview">
          <span class="material-symbols-outlined comms-page__preview-icon">people</span>
          <span v-if="isLoadingPreview" class="comms-page__preview-text">Calculando...</span>
          <span v-else-if="previewCount !== null" class="comms-page__preview-text">
            ~{{ previewCount.toLocaleString('es-CO') }} usuarios recibirán este mensaje
          </span>
        </div>

        <button class="comms-page__send-btn" :disabled="isSending" @click="openConfirm">
          <span class="material-symbols-outlined">campaign</span>
          {{ isSending ? 'Enviando...' : 'Enviar anuncio' }}
        </button>
      </div>

      <!-- Historial -->
      <div class="comms-page__card">
        <Heading level="h3" size="lg" weight="semibold">Historial de envíos</Heading>

        <div v-if="isLoadingAnnouncements" class="comms-page__skeleton-list">
          <div v-for="n in 4" :key="n" class="comms-page__skeleton-row" />
        </div>

        <div v-else-if="!announcements.length" class="comms-page__empty">
          <span class="material-symbols-outlined comms-page__empty-icon">campaign</span>
          <Text size="sm" color="muted">Aún no hay anuncios enviados</Text>
        </div>

        <table v-else class="comms-page__table">
          <thead>
            <tr>
              <th class="comms-page__th">Fecha</th>
              <th class="comms-page__th">Título</th>
              <th class="comms-page__th">Segmento</th>
              <th class="comms-page__th comms-page__th--right">Destinatarios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in announcements" :key="item.id" class="comms-page__row">
              <td class="comms-page__td comms-page__td--date">{{ formatDate(item.sentAt) }}</td>
              <td class="comms-page__td comms-page__td--title">{{ item.title }}</td>
              <td class="comms-page__td">
                <span class="comms-page__badge">
                  {{ segmentLabel[item.segment] || item.segment }}
                </span>
              </td>
              <td class="comms-page__td comms-page__td--right">
                {{ item.recipientCount.toLocaleString('es-CO') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="comms-modal__backdrop" @click.self="cancelSend">
        <div class="comms-modal">
          <div class="comms-modal__header">
            <span class="material-symbols-outlined comms-modal__icon">warning</span>
            <Heading level="h3" size="lg" weight="semibold">Confirmar envío</Heading>
          </div>
          <Text size="sm" color="muted">
            ¿Enviar a ~{{ (previewCount ?? 0).toLocaleString('es-CO') }} usuarios? Esta acción no se
            puede deshacer.
          </Text>
          <div class="comms-modal__actions">
            <button class="comms-modal__btn comms-modal__btn--cancel" @click="cancelSend">
              Cancelar
            </button>
            <button class="comms-modal__btn comms-modal__btn--confirm" @click="confirmSend">
              Confirmar envío
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
  .comms-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .comms-page__header {
    @apply flex flex-col gap-1;
  }

  .comms-page__grid {
    @apply flex flex-col gap-4 xl:grid xl:grid-cols-2;
  }

  .comms-page__card {
    @apply flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .comms-page__field {
    @apply flex flex-col gap-1.5;
  }

  .comms-page__label {
    @apply text-xs font-semibold text-neutral-600 dark:text-neutral-400;
  }

  .comms-page__input {
    @apply w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white;
  }

  .comms-page__textarea {
    @apply w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white;
  }

  .comms-page__select {
    @apply w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white;
  }

  .comms-page__preview {
    @apply flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-900/20;
  }

  .comms-page__preview-icon {
    @apply text-base text-primary-600 dark:text-primary-400;
  }

  .comms-page__preview-text {
    @apply text-sm font-medium text-primary-700 dark:text-primary-300;
  }

  .comms-page__send-btn {
    @apply flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60;
  }

  .comms-page__send-btn .material-symbols-outlined {
    @apply text-base;
  }

  .comms-page__skeleton-list {
    @apply flex flex-col gap-2;
  }

  .comms-page__skeleton-row {
    @apply h-10 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .comms-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .comms-page__empty-icon {
    @apply text-5xl text-neutral-300;
  }

  .comms-page__table {
    @apply w-full border-collapse;
  }

  .comms-page__th {
    @apply border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400;
  }

  .comms-page__th--right {
    @apply text-right;
  }

  .comms-page__row {
    @apply border-b border-neutral-100 last:border-0 dark:border-neutral-700;
  }

  .comms-page__td {
    @apply px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300;
  }

  .comms-page__td--date {
    @apply whitespace-nowrap text-xs text-neutral-500;
  }

  .comms-page__td--title {
    @apply max-w-[180px] truncate font-medium;
  }

  .comms-page__td--right {
    @apply text-right font-medium;
  }

  .comms-page__badge {
    @apply rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300;
  }

  /* Modal */
  .comms-modal__backdrop {
    @apply fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm;
  }

  .comms-modal {
    @apply flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-800;
  }

  .comms-modal__header {
    @apply flex items-center gap-3;
  }

  .comms-modal__icon {
    @apply text-2xl text-warning-500;
  }

  .comms-modal__actions {
    @apply flex justify-end gap-3;
  }

  .comms-modal__btn {
    @apply rounded-lg px-4 py-2 text-sm font-semibold transition-colors;
  }

  .comms-modal__btn--cancel {
    @apply bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600;
  }

  .comms-modal__btn--confirm {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
</style>
