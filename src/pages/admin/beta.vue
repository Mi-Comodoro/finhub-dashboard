<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useBetaAccessApplication } from '@/composables/application/useBetaAccessApplication'
  import { useTimezone } from '@/composables/useTimezone'
  import type { BetaAccessRequest, BetaAccessStatus, BetaInvite } from '@/types/beta-access.types'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Acceso a la beta',
    breadcrumb: 'Acceso a la beta'
  })

  type Filter = BetaAccessStatus | 'all'

  const { requests, summary, isLoading, error, refresh, approve, reject, buildInviteLink } =
    useBetaAccessApplication()
  const { show: showToast } = useToast()
  const { formatDate } = useTimezone()

  const filters: { value: Filter; label: string }[] = [
    { value: 'pending', label: 'Pendientes' },
    { value: 'approved', label: 'Invitadas' },
    { value: 'registered', label: 'Registradas' },
    { value: 'rejected', label: 'Rechazadas' },
    { value: 'all', label: 'Todas' }
  ]

  const statusLabel: Record<BetaAccessStatus, string> = {
    pending: 'Pendiente',
    approved: 'Invitada',
    registered: 'Registrada',
    rejected: 'Rechazada'
  }

  const statusVariant = {
    pending: 'warning',
    approved: 'info',
    registered: 'success',
    rejected: 'default'
  } as const

  const filter = ref<Filter>('pending')
  const workingId = ref<string | null>(null)

  // Invitation shown once after approving (the token is not stored anywhere readable)
  const invite = ref<BetaInvite | null>(null)
  const inviteLink = computed(() => (invite.value ? buildInviteLink(invite.value.inviteToken) : ''))
  const showInviteModal = computed({
    get: () => invite.value !== null,
    set: open => {
      if (!open) invite.value = null
    }
  })

  const requestToReject = ref<BetaAccessRequest | null>(null)
  const showRejectModal = computed({
    get: () => requestToReject.value !== null,
    set: open => {
      if (!open) requestToReject.value = null
    }
  })

  const load = () => refresh(filter.value === 'all' ? undefined : filter.value)

  const quotaLabel = computed(() =>
    summary.value ? `${summary.value.used} de ${summary.value.maxUsers}` : '—'
  )
  const isQuotaFull = computed(
    () => !!summary.value && summary.value.used >= summary.value.maxUsers
  )

  const handleApprove = async (item: BetaAccessRequest) => {
    workingId.value = item.id
    const result = await approve(item.id)
    workingId.value = null

    if (!result.success || !result.invite) {
      showToast({
        title: 'No se pudo aprobar',
        description: result.error ?? 'Inténtalo de nuevo',
        type: 'error'
      })
      return
    }

    invite.value = result.invite
    await load()
  }

  const confirmReject = async () => {
    const item = requestToReject.value
    if (!item) return
    workingId.value = item.id
    const result = await reject(item.id)
    workingId.value = null
    requestToReject.value = null

    if (!result.success) {
      showToast({
        title: 'No se pudo rechazar',
        description: result.error ?? 'Inténtalo de nuevo',
        type: 'error'
      })
      return
    }

    showToast({
      title: 'Solicitud rechazada',
      description: 'Se borrará en 30 días',
      type: 'success'
    })
    await load()
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink.value)
      showToast({
        title: 'Enlace copiado',
        description: 'Envíalo a la persona invitada',
        type: 'success'
      })
    } catch {
      showToast({
        title: 'No se pudo copiar',
        description: 'Selecciona el enlace y cópialo a mano',
        type: 'error'
      })
    }
  }

  watch(filter, load)
  onMounted(load)
</script>

<template>
  <div class="beta-page">
    <div class="beta-page__header">
      <Heading level="h1" size="2xl" weight="extrabold">Acceso a la beta</Heading>
      <Text size="xs" color="muted">
        Revisa las solicitudes y envía la invitación a quien apruebes. El enlace es de un solo uso y
        solo sirve para el correo invitado.
      </Text>
    </div>

    <div class="beta-page__kpis">
      <div class="beta-page__kpi">
        <Text size="xs" color="muted">Pendientes</Text>
        <Heading level="h3" size="xl" weight="bold">{{ summary?.pending ?? '—' }}</Heading>
      </div>
      <div class="beta-page__kpi">
        <Text size="xs" color="muted">Invitadas, sin registrarse</Text>
        <Heading level="h3" size="xl" weight="bold">{{ summary?.approved ?? '—' }}</Heading>
      </div>
      <div class="beta-page__kpi">
        <Text size="xs" color="muted">Registradas</Text>
        <Heading level="h3" size="xl" weight="bold">{{ summary?.registered ?? '—' }}</Heading>
      </div>
      <div class="beta-page__kpi" :class="{ 'beta-page__kpi--full': isQuotaFull }">
        <Text size="xs" color="muted">Cupo usado</Text>
        <Heading level="h3" size="xl" weight="bold">{{ quotaLabel }}</Heading>
        <Text size="xs" color="muted">Se cambia en Configuración (beta_max_users)</Text>
      </div>
    </div>

    <div class="beta-page__card">
      <div class="beta-page__tabs" role="tablist" aria-label="Estado de la solicitud">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          role="tab"
          :aria-selected="filter === f.value"
          class="beta-page__tab"
          :class="{ 'beta-page__tab--active': filter === f.value }"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <div v-if="isLoading && !requests.length" class="beta-page__skeleton-list">
        <div v-for="n in 4" :key="n" class="beta-page__skeleton-row" />
      </div>

      <div v-else-if="error" class="beta-page__empty">
        <Text size="sm" color="muted">{{ error }}</Text>
      </div>

      <div v-else-if="!requests.length" class="beta-page__empty">
        <EmptyStateIllustration type="no-transactions" class="beta-page__empty-illustration" />
        <Heading level="h3" size="lg" weight="semibold">No hay solicitudes aquí</Heading>
        <Text size="sm" color="muted">
          Las solicitudes llegan desde el formulario de la landing.
        </Text>
      </div>

      <div v-else class="beta-page__table-wrap">
        <table class="beta-page__table">
          <thead>
            <tr>
              <th class="beta-page__th">Correo</th>
              <th class="beta-page__th">Estado</th>
              <th class="beta-page__th">Solicitud</th>
              <th class="beta-page__th">Invitación vence</th>
              <th class="beta-page__th beta-page__th--right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in requests" :key="item.id" class="beta-page__row">
              <td class="beta-page__td beta-page__td--email">
                {{ item.email ?? 'Ya tiene cuenta' }}
              </td>
              <td class="beta-page__td">
                <Badge :variant="statusVariant[item.status]" size="sm">
                  {{ statusLabel[item.status] }}
                </Badge>
              </td>
              <td class="beta-page__td beta-page__td--muted">{{ formatDate(item.createdAt) }}</td>
              <td class="beta-page__td beta-page__td--muted">
                {{ item.inviteExpiresAt ? formatDate(item.inviteExpiresAt) : '—' }}
              </td>
              <td class="beta-page__td beta-page__td--right">
                <div class="beta-page__actions">
                  <Button
                    v-if="item.status === 'pending' || item.status === 'approved'"
                    variant="primary"
                    size="sm"
                    :loading="workingId === item.id"
                    :disabled="workingId !== null"
                    @click="handleApprove(item)"
                  >
                    {{ item.status === 'pending' ? 'Aprobar' : 'Nueva invitación' }}
                  </Button>
                  <Button
                    v-if="item.status === 'pending' || item.status === 'approved'"
                    variant="ghost"
                    size="sm"
                    :disabled="workingId !== null"
                    @click="requestToReject = item"
                  >
                    Rechazar
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Invitación: el enlace solo se muestra ahora -->
    <ModalWizard v-model:show="showInviteModal" :protect-unsaved="false">
      <div v-if="invite" class="beta-modal">
        <CardInfo
          title="Invitación lista"
          sub-title="Envíala a la persona por WhatsApp o correo"
          icon="mail"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon-size="md"
          icon-variant="primary"
        />

        <Text size="sm">
          Invitación para
          <strong>{{ invite.email }}.</strong>
          Vence el {{ formatDate(invite.inviteExpiresAt) }} y solo se puede usar una vez.
        </Text>

        <div class="beta-modal__link">
          <input
            class="beta-modal__input"
            type="text"
            readonly
            :value="inviteLink"
            aria-label="Enlace de invitación"
            @focus="($event.target as HTMLInputElement).select()"
          />
          <Button variant="primary" size="sm" icon="content_copy" @click="copyLink">Copiar</Button>
        </div>

        <AlertBanner variant="warning" title="Este enlace se muestra solo ahora">
          Si lo pierdes, usa «Nueva invitación»: el enlace anterior deja de funcionar.
        </AlertBanner>

        <div class="beta-modal__actions">
          <Button variant="ghost" size="sm" @click="showInviteModal = false">Cerrar</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- Confirmación de rechazo -->
    <ModalWizard v-model:show="showRejectModal" :protect-unsaved="false">
      <div v-if="requestToReject" class="beta-modal">
        <CardInfo
          title="Rechazar solicitud"
          sub-title="La persona tendría que pedir acceso de nuevo"
          icon="person_off"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon-size="md"
          icon-variant="primary"
        />
        <Text size="sm">
          Se rechazará la solicitud de
          <strong>{{ requestToReject.email }}</strong>
          y se borrará a los 30 días. Si ya tenía una invitación, deja de funcionar.
        </Text>
        <div class="beta-modal__actions">
          <Button variant="ghost" size="sm" @click="showRejectModal = false">Mejor no</Button>
          <Button
            variant="danger"
            size="sm"
            :loading="workingId === requestToReject.id"
            @click="confirmReject"
          >
            Rechazar
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .beta-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .beta-page__header {
    @apply flex flex-col gap-1;
  }

  .beta-page__kpis {
    @apply grid grid-cols-2 gap-4 xl:grid-cols-4;
  }

  .beta-page__kpi {
    @apply flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-5;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .beta-page__kpi--full {
    @apply border-warning-300 bg-warning-50;
    @apply dark:border-warning-700 dark:bg-warning-900/20;
  }

  .beta-page__card {
    @apply flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .beta-page__tabs {
    @apply flex flex-wrap gap-2;
  }

  .beta-page__tab {
    @apply rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-semibold text-neutral-600;
    @apply transition-colors hover:border-primary-400 hover:text-primary-700;
    @apply dark:border-neutral-600 dark:text-neutral-300;
  }

  .beta-page__tab--active {
    @apply border-primary-600 bg-primary-600 text-white hover:text-white;
  }

  .beta-page__skeleton-list {
    @apply flex flex-col gap-2;
  }

  .beta-page__skeleton-row {
    @apply h-10 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .beta-page__empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .beta-page__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  .beta-page__table-wrap {
    @apply overflow-x-auto;
  }

  .beta-page__table {
    @apply w-full border-collapse;
  }

  .beta-page__th {
    @apply border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500;
    @apply dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400;
  }

  .beta-page__th--right {
    @apply text-right;
  }

  .beta-page__row {
    @apply border-b border-neutral-100 last:border-0 dark:border-neutral-700;
  }

  .beta-page__td {
    @apply px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300;
  }

  .beta-page__td--email {
    @apply font-medium;
  }

  .beta-page__td--muted {
    @apply whitespace-nowrap text-xs text-neutral-500;
  }

  .beta-page__td--right {
    @apply text-right;
  }

  .beta-page__actions {
    @apply flex justify-end gap-2;
  }

  .beta-modal {
    @apply flex flex-col gap-4 p-1;
  }

  .beta-modal__link {
    @apply flex items-center gap-2;
  }

  .beta-modal__input {
    @apply min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-800;
    @apply dark:border-neutral-600 dark:bg-neutral-700 dark:text-white;
  }

  .beta-modal__actions {
    @apply flex justify-end gap-2;
  }
</style>
