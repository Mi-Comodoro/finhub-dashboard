<script setup lang="ts">
  import { defineAsyncComponent, onMounted, ref } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'
  import type { AdminUser, GrowthPeriod } from '@/types/domain'

  const AdminUserGrowthChart = defineAsyncComponent(
    () => import('@/components/business/admin/AdminUserGrowthChart.vue')
  )

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Panel Admin',
    breadcrumb: 'Panel Admin'
  })

  const {
    metricsSummary,
    growthData,
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    isLoadingMetrics,
    isLoadingGrowth,
    fetchMetricsSummary,
    fetchUsers,
    fetchUserGrowth,
    fetchUserDetail,
    clearSelectedUser
  } = useAdminApplication()

  const showUserPanel = ref(false)
  const selectedPeriod = ref<GrowthPeriod>('30d')

  const periodOptions: { value: GrowthPeriod; label: string }[] = [
    { value: '30d', label: '30 días' },
    { value: '90d', label: '90 días' },
    { value: '12m', label: '12 meses' }
  ]

  const metricCards = [
    {
      key: 'totalUsers' as const,
      deltaKey: 'totalUsers' as const,
      label: 'Total usuarios',
      icon: 'group'
    },
    {
      key: 'activeThisMonth' as const,
      deltaKey: 'activeThisMonth' as const,
      label: 'Activos este mes',
      icon: 'person_check'
    },
    {
      key: 'trialUsers' as const,
      deltaKey: 'trialUsers' as const,
      label: 'En trial',
      icon: 'hourglass_top'
    },
    {
      key: 'payingUsers' as const,
      deltaKey: 'payingUsers' as const,
      label: 'Plan de pago',
      icon: 'workspace_premium'
    },
    {
      key: 'conversionRate' as const,
      deltaKey: null,
      label: 'Tasa conversión',
      icon: 'conversion_path'
    },
    {
      key: 'activeBudgets' as const,
      deltaKey: null,
      label: 'Presupuestos activos',
      icon: 'account_balance_wallet'
    }
  ]

  const formatMetricValue = (key: string, value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-'
    if (key === 'conversionRate') return `${value.toFixed(1)}%`
    return value.toLocaleString('es-CO')
  }

  const openUserDetail = async (user: AdminUser) => {
    showUserPanel.value = true
    await fetchUserDetail(user.id)
  }

  const closeUserPanel = () => {
    showUserPanel.value = false
    clearSelectedUser()
  }

  const goToPage = async (page: number) => {
    await fetchUsers(page)
  }

  const selectPeriod = async (period: GrowthPeriod) => {
    selectedPeriod.value = period
    await fetchUserGrowth(period)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  onMounted(async () => {
    await Promise.all([fetchMetricsSummary(), fetchUsers(), fetchUserGrowth('30d')])
  })
</script>

<template>
  <div class="admin-page">
    <div class="admin-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Panel de Administración</Heading>
        <Text size="xs" color="muted">Métricas globales y gestión de usuarios</Text>
      </div>
    </div>

    <!-- KPI Cards -->
    <section class="admin-page__metrics">
      <div v-if="isLoadingMetrics" class="admin-page__metrics-grid">
        <div v-for="i in 6" :key="i" class="admin-page__metric-skeleton" />
      </div>

      <div v-else class="admin-page__metrics-grid">
        <div v-for="card in metricCards" :key="card.key" class="admin-page__metric-card">
          <div class="admin-page__metric-header">
            <span class="material-symbols-outlined admin-page__metric-icon">{{ card.icon }}</span>
            <Text size="xs" color="muted">{{ card.label }}</Text>
          </div>

          <div class="admin-page__metric-value">
            {{ formatMetricValue(card.key, metricsSummary?.[card.key]) }}
          </div>

          <div
            v-if="card.deltaKey && metricsSummary"
            class="admin-page__metric-delta"
            :class="
              (metricsSummary.deltas[card.deltaKey] ?? 0) > 0
                ? 'admin-page__metric-delta--up'
                : (metricsSummary.deltas[card.deltaKey] ?? 0) < 0
                  ? 'admin-page__metric-delta--down'
                  : 'admin-page__metric-delta--neutral'
            "
          >
            <span v-if="(metricsSummary.deltas[card.deltaKey] ?? 0) > 0">↑</span>
            <span v-else-if="(metricsSummary.deltas[card.deltaKey] ?? 0) < 0">↓</span>
            <span v-else>—</span>
            <span v-if="(metricsSummary.deltas[card.deltaKey] ?? 0) !== 0">
              {{ Math.abs(metricsSummary.deltas[card.deltaKey] ?? 0) }} vs mes anterior
            </span>
            <span v-else>sin cambios</span>
          </div>

          <div
            v-else-if="!card.deltaKey"
            class="admin-page__metric-delta admin-page__metric-delta--neutral"
          >
            &nbsp;
          </div>
        </div>
      </div>
    </section>

    <!-- Growth Chart -->
    <section class="admin-page__growth">
      <div class="admin-page__growth-header">
        <div>
          <Heading level="h3" size="lg" weight="semibold">Crecimiento de usuarios</Heading>
          <Text size="xs" color="muted" class="admin-page__growth-subtitle">
            <template v-if="growthData">
              {{ growthData.summary.total }} nuevos ·
              {{ growthData.summary.growthRate > 0 ? '+' : '' }}{{ growthData.summary.growthRate }}%
              vs período anterior
            </template>
          </Text>
        </div>

        <div class="admin-page__period-selector">
          <button
            v-for="opt in periodOptions"
            :key="opt.value"
            class="admin-page__period-btn"
            :class="{ 'admin-page__period-btn--active': selectedPeriod === opt.value }"
            @click="selectPeriod(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="admin-page__growth-body">
        <div v-if="isLoadingGrowth" class="admin-page__growth-skeleton" />

        <template v-else-if="growthData && growthData.data.length > 0">
          <AdminUserGrowthChart :data="growthData.data" :period="selectedPeriod" />
        </template>

        <div v-else class="admin-page__empty-state">
          <EmptyStateIllustration type="no-transactions" class="admin-page__empty-illustration" />
          <Heading level="h3" size="lg" weight="semibold">Gráfica disponible próximamente</Heading>
          <Text size="sm" color="muted">
            No hay datos suficientes para mostrar la gráfica de crecimiento.
          </Text>
        </div>
      </div>
    </section>

    <!-- Activity Table -->
    <section class="admin-page__activity">
      <div class="admin-page__section-header">
        <Heading level="h3" size="lg" weight="semibold">Actividad reciente</Heading>
      </div>

      <div class="admin-page__empty-state">
        <EmptyStateIllustration type="no-transactions" class="admin-page__empty-illustration" />
        <Heading level="h3" size="lg" weight="semibold">
          Historial de actividad disponible próximamente
        </Heading>
        <Text size="sm" color="muted">
          El registro de actividad del sistema estará disponible en la próxima versión.
        </Text>
      </div>
    </section>

    <!-- Users Table -->
    <section class="admin-page__users">
      <div class="admin-page__users-header">
        <Heading level="h3" size="lg" weight="semibold">Usuarios</Heading>
        <Text size="xs" color="muted">{{ pagination.total }} usuarios en total</Text>
      </div>

      <div v-if="isLoading" class="admin-page__table-skeleton" />

      <div v-else class="admin-page__table-wrapper">
        <table class="admin-page__table">
          <thead>
            <tr>
              <th class="admin-page__th">Nombre</th>
              <th class="admin-page__th">Email</th>
              <th class="admin-page__th">Rol</th>
              <th class="admin-page__th">Registro</th>
              <th class="admin-page__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="admin-page__tr">
              <td class="admin-page__td">
                <Text size="sm" weight="medium">{{ user.displayName }}</Text>
              </td>
              <td class="admin-page__td">
                <Text size="sm" color="muted">{{ user.email }}</Text>
              </td>
              <td class="admin-page__td">
                <Badge :variant="user.role === 'admin' ? 'danger' : 'default'" size="sm">
                  {{ user.role }}
                </Badge>
              </td>
              <td class="admin-page__td">
                <Text size="sm" color="muted">{{ formatDate(user.createdAt) }}</Text>
              </td>
              <td class="admin-page__td">
                <Button size="sm" variant="ghost" @click="openUserDetail(user)">Ver detalle</Button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="admin-page__td--empty">
                <Text size="sm" color="muted">No hay usuarios registrados</Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="admin-page__pagination">
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_left"
          :disabled="pagination.page <= 1"
          @click="goToPage(pagination.page - 1)"
        >
          Anterior
        </Button>
        <Text size="sm" color="muted">
          Página {{ pagination.page }} de {{ pagination.totalPages }}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_right"
          :disabled="pagination.page >= pagination.totalPages"
          @click="goToPage(pagination.page + 1)"
        >
          Siguiente
        </Button>
      </div>
    </section>

    <ModalWizard :show="showUserPanel">
      <div class="admin-page__modal">
        <CardInfo
          title="Detalle del usuario"
          sub-title="Información del usuario seleccionado"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="person"
          icon-size="md"
          icon-variant="primary"
        />

        <div v-if="isLoadingUser" class="admin-page__panel-skeleton" />

        <div v-else-if="selectedUser" class="admin-page__panel-content">
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Nombre</Text>
            <Text size="sm" weight="medium">{{ selectedUser.displayName }}</Text>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Email</Text>
            <Text size="sm">{{ selectedUser.email }}</Text>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Rol</Text>
            <Badge :variant="selectedUser.role === 'admin' ? 'danger' : 'default'" size="sm">
              {{ selectedUser.role }}
            </Badge>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">País</Text>
            <Text size="sm">{{ selectedUser.country || '-' }}</Text>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Tipo de cuenta</Text>
            <Text size="sm">{{ selectedUser.accountType || '-' }}</Text>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Registro</Text>
            <Text size="sm">{{ formatDate(selectedUser.createdAt) }}</Text>
          </div>
          <div class="admin-page__panel-row">
            <Text size="xs" color="muted">Estado</Text>
            <Badge :variant="selectedUser.isActive ? 'success' : 'default'" size="sm">
              {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
            </Badge>
          </div>
        </div>

        <div class="admin-page__modal-actions">
          <Button variant="ghost" size="sm" @click="closeUserPanel">Cerrar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .admin-page {
    @apply space-y-4 px-4 py-2;
  }

  .admin-page__header {
    @apply flex items-center justify-between;
  }

  /* KPI Metrics */
  .admin-page__metrics-grid {
    @apply grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6;
  }

  .admin-page__metric-skeleton {
    @apply h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-page__metric-card {
    @apply flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-page__metric-header {
    @apply flex items-center gap-2;
  }

  .admin-page__metric-icon {
    @apply text-base text-primary-600;
    font-size: 18px;
  }

  .admin-page__metric-value {
    @apply mt-1 text-2xl font-extrabold text-neutral-900 dark:text-white;
  }

  .admin-page__metric-delta {
    @apply text-xs font-medium;
  }

  .admin-page__metric-delta--up {
    @apply text-success-600;
  }

  .admin-page__metric-delta--down {
    @apply text-danger-600;
  }

  .admin-page__metric-delta--neutral {
    @apply text-neutral-400;
  }

  /* Growth Chart */
  .admin-page__growth {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-page__growth-header {
    @apply flex items-start justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  .admin-page__growth-subtitle {
    @apply mt-0.5;
  }

  .admin-page__period-selector {
    @apply flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700;
  }

  .admin-page__period-btn {
    @apply rounded-md px-3 py-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white;
  }

  .admin-page__period-btn--active {
    @apply bg-white text-neutral-900 shadow-sm dark:bg-neutral-600 dark:text-white;
  }

  .admin-page__growth-body {
    @apply p-5;
  }

  .admin-page__growth-skeleton {
    @apply h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700;
  }

  /* Activity */
  .admin-page__activity {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-page__section-header {
    @apply border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  /* Empty State */
  .admin-page__empty-state {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .admin-page__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  /* Users Table */
  .admin-page__users {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-page__users-header {
    @apply flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  .admin-page__table-skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-page__table-wrapper {
    @apply overflow-x-auto;
  }

  .admin-page__table {
    @apply w-full text-left;
  }

  .admin-page__th {
    @apply border-b border-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400;
  }

  .admin-page__tr {
    @apply border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .admin-page__td {
    @apply px-5 py-3;
  }

  .admin-page__td--empty {
    @apply px-5 py-12 text-center;
  }

  .admin-page__pagination {
    @apply flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  /* User Detail Panel */
  .admin-page__panel-header {
    @apply p-4;
  }

  .admin-page__panel-body {
    @apply p-4;
  }

  .admin-page__panel-skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-page__panel-content {
    @apply space-y-4;
  }

  .admin-page__panel-row {
    @apply flex flex-col gap-1;
  }

  .admin-page__modal {
    @apply flex flex-col gap-4;
  }

  .admin-page__modal-actions {
    @apply flex justify-end pt-2;
  }
</style>
