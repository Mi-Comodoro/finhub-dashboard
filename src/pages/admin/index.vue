<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import CardInfo from '@/components/molecules/card-info/CardInfo.vue'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'
  import type { AdminUser } from '@/types/domain'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Panel Admin',
    breadcrumb: 'Panel Admin'
  })

  const {
    stats,
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    fetchStats,
    fetchUsers,
    fetchUserDetail,
    clearSelectedUser
  } = useAdminApplication()

  const showUserPanel = ref(false)

  const statCards = [
    { key: 'totalUsers', label: 'Total usuarios', icon: 'group' },
    { key: 'activeUsers', label: 'Usuarios activos', icon: 'person_check' },
    { key: 'totalBudgets', label: 'Total presupuestos', icon: 'account_balance_wallet' },
    { key: 'totalTransactions', label: 'Total transacciones', icon: 'swap_vertical_circle' },
    { key: 'newUsersLast7Days', label: 'Nuevos últimos 7 días', icon: 'calendar_today' },
    { key: 'newUsersLast30Days', label: 'Nuevos últimos 30 días', icon: 'date_range' }
  ] as const

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  onMounted(async () => {
    await Promise.all([fetchStats(), fetchUsers()])
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

    <section class="admin-page__stats">
      <div v-if="isLoading" class="admin-page__stats-grid">
        <div v-for="i in 6" :key="i" class="admin-page__stat-skeleton" />
      </div>

      <div v-else class="admin-page__stats-grid">
        <div v-for="card in statCards" :key="card.key" class="admin-page__stat-card">
          <CardInfo
            :title="String(stats?.[card.key] ?? '-')"
            :sub-title="card.label"
            :icon="card.icon"
            title-size="xl"
            weight="extrabold"
            level="h1"
            color="black"
            sub-title-size="xs"
            sub-title-color="muted"
            icon-size="md"
            icon-variant="primary"
          />
        </div>
      </div>
    </section>

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
                <UBadge
                  :color="user.role === 'admin' ? 'red' : 'neutral'"
                  variant="subtle"
                  size="sm"
                >
                  {{ user.role }}
                </UBadge>
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

    <USlideover
      v-model:open="showUserPanel"
      side="right"
      @update:open="val => !val && closeUserPanel()"
    >
      <template #header>
        <div class="admin-page__panel-header">
          <Heading level="h3" size="lg" weight="semibold">Detalle del usuario</Heading>
        </div>
      </template>

      <div class="admin-page__panel-body">
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
            <UBadge
              :color="selectedUser.role === 'admin' ? 'red' : 'neutral'"
              variant="subtle"
              size="sm"
            >
              {{ selectedUser.role }}
            </UBadge>
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
            <UBadge :color="selectedUser.isActive ? 'green' : 'neutral'" variant="subtle" size="sm">
              {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
            </UBadge>
          </div>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<style scoped lang="postcss">
  .admin-page {
    @apply space-y-4 px-4 py-2;
  }

  .admin-page__header {
    @apply flex items-center justify-between;
  }

  .admin-page__stats-grid {
    @apply grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6;
  }

  .admin-page__stat-card {
    @apply rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-page__stat-skeleton {
    @apply h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

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
</style>
