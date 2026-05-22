<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import SearchInput from '@/components/molecules/input/SearchInput.vue'
  import Select from '@/components/molecules/select/Select.vue'
  import { ModalWizard } from '@/components/organisms'
  import { useAdminApplication } from '@/composables/application/useAdminApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import type { AdminUser } from '@/types/domain'

  definePageMeta({
    layout: 'dashboard',
    ssr: false,
    middleware: ['auth', 'admin'],
    title: 'Usuarios',
    breadcrumb: 'Usuarios',
    parents: ['Admin']
  })

  const {
    users,
    selectedUser,
    pagination,
    isLoading,
    isLoadingUser,
    fetchUsers,
    fetchUserDetail,
    changeRole,
    clearSelectedUser
  } = useAdminApplication()

  const { success: successToast, error: errorToast } = useFeedback()

  // ── Filters ────────────────────────────────────────────────────────────────
  const searchQuery = ref('')
  const filterRole = ref('all')
  const filterStatus = ref('all')

  const roleFilterOptions = [
    { value: 'all', label: 'Todos los roles' },
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' }
  ]

  const statusFilterOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ]

  const filteredUsers = computed(() => {
    let result = users.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        u => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }
    if (filterRole.value !== 'all') {
      result = result.filter(u => u.role === filterRole.value)
    }
    if (filterStatus.value !== 'all') {
      const active = filterStatus.value === 'active'
      result = result.filter(u => u.isActive === active)
    }

    return result
  })

  // ── Pagination (client-side over loaded page) ───────────────────────────
  const ITEMS_PER_PAGE = 15
  const currentPage = ref(1)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredUsers.value.length / ITEMS_PER_PAGE))
  )

  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * ITEMS_PER_PAGE
    return filteredUsers.value.slice(start, start + ITEMS_PER_PAGE)
  })

  watch([searchQuery, filterRole, filterStatus], () => {
    currentPage.value = 1
  })

  // ── Detail slideover ───────────────────────────────────────────────────
  const showDetailPanel = ref(false)

  const openDetail = async (user: AdminUser) => {
    showDetailPanel.value = true
    await fetchUserDetail(user.id)
  }

  const closeDetail = () => {
    showDetailPanel.value = false
    clearSelectedUser()
    pendingRole.value = null
  }

  // ── Role change ────────────────────────────────────────────────────────
  const pendingRole = ref<'admin' | 'user' | null>(null)
  const showRoleModal = ref(false)

  const openRoleModal = (role: 'admin' | 'user') => {
    pendingRole.value = role
    showRoleModal.value = true
  }

  const cancelRoleChange = () => {
    showRoleModal.value = false
    pendingRole.value = null
  }

  const confirmRoleChange = async () => {
    if (!selectedUser.value || !pendingRole.value) return
    const { success } = await changeRole(selectedUser.value.id, pendingRole.value)
    if (success) {
      successToast(
        'Rol actualizado',
        `El usuario ahora es ${pendingRole.value === 'admin' ? 'administrador' : 'usuario'}.`
      )
      cancelRoleChange()
      await fetchUsers()
    } else {
      errorToast('Error al actualizar', 'No se pudo cambiar el rol del usuario.')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  onMounted(async () => {
    await fetchUsers()
  })
</script>

<template>
  <div class="admin-users-page">
    <div class="admin-users-page__header">
      <div>
        <Heading level="h1" size="2xl" weight="extrabold">Usuarios</Heading>
        <Text size="xs" color="muted">Gestión y supervisión de cuentas de usuario</Text>
      </div>
    </div>

    <section class="admin-users-page__table-section">
      <div class="admin-users-page__table-header">
        <div>
          <Heading level="h3" size="lg" weight="semibold">Listado de usuarios</Heading>
          <Text size="xs" color="muted">
            {{ filteredUsers.length }} de {{ pagination.total }} usuarios
          </Text>
        </div>
      </div>

      <div class="admin-users-page__filters">
        <div class="admin-users-page__search">
          <SearchInput
            name="user-search"
            :model-value="searchQuery"
            placeholder="Buscar por nombre o email..."
            @update:model-value="val => (searchQuery = val)"
          />
        </div>
        <div class="admin-users-page__filter-selects">
          <Select
            name="filter-role"
            :model-value="filterRole"
            :options="roleFilterOptions"
            @update:model-value="val => (filterRole = String(val))"
          />
          <Select
            name="filter-status"
            :model-value="filterStatus"
            :options="statusFilterOptions"
            @update:model-value="val => (filterStatus = String(val))"
          />
        </div>
      </div>

      <div v-if="isLoading" class="admin-users-page__skeleton" />

      <div v-else class="admin-users-page__table-wrapper">
        <table class="admin-users-page__table">
          <thead>
            <tr>
              <th class="admin-users-page__th">Nombre</th>
              <th class="admin-users-page__th">Email</th>
              <th class="admin-users-page__th">Rol</th>
              <th class="admin-users-page__th">Estado</th>
              <th class="admin-users-page__th">Registro</th>
              <th class="admin-users-page__th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.id" class="admin-users-page__tr">
              <td class="admin-users-page__td">
                <Text size="sm" weight="medium">{{ user.displayName }}</Text>
              </td>
              <td class="admin-users-page__td">
                <Text size="sm" color="muted">{{ user.email }}</Text>
              </td>
              <td class="admin-users-page__td">
                <Badge :variant="user.role === 'admin' ? 'danger' : 'default'">
                  {{ user.role === 'admin' ? 'Admin' : 'Usuario' }}
                </Badge>
              </td>
              <td class="admin-users-page__td">
                <Badge :variant="user.isActive ? 'success' : 'default'">
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </Badge>
              </td>
              <td class="admin-users-page__td">
                <Text size="sm" color="muted">{{ formatDate(user.createdAt) }}</Text>
              </td>
              <td class="admin-users-page__td">
                <Button size="sm" variant="ghost" @click="openDetail(user)">Ver detalle</Button>
              </td>
            </tr>

            <tr v-if="paginatedUsers.length === 0">
              <td colspan="6" class="admin-users-page__td--empty">
                <Text size="sm" color="muted">
                  {{
                    searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                      ? 'Sin resultados para los filtros aplicados'
                      : 'No hay usuarios registrados'
                  }}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="admin-users-page__pagination">
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_left"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          Anterior
        </Button>
        <Text size="sm" color="muted">Página {{ currentPage }} de {{ totalPages }}</Text>
        <Button
          size="sm"
          variant="ghost"
          icon="chevron_right"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Siguiente
        </Button>
      </div>
    </section>

    <!-- ── Slideover detalle ────────────────────────────────────────────── -->
    <USlideover
      v-model:open="showDetailPanel"
      side="right"
      @update:open="val => !val && closeDetail()"
    >
      <template #header>
        <Heading level="h3" size="lg" weight="semibold">Detalle del usuario</Heading>
      </template>

      <div class="admin-users-page__panel-body">
        <div v-if="isLoadingUser" class="admin-users-page__panel-skeleton" />

        <div v-else-if="selectedUser" class="admin-users-page__panel-content">
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Nombre</Text>
            <Text size="sm" weight="medium">{{ selectedUser.displayName }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Email</Text>
            <Text size="sm">{{ selectedUser.email }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Teléfono</Text>
            <Text size="sm">{{ selectedUser.phone || '-' }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">País</Text>
            <Text size="sm">{{ selectedUser.country || '-' }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Tipo de cuenta</Text>
            <Text size="sm">{{ selectedUser.accountType || '-' }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Registro</Text>
            <Text size="sm">{{ formatDate(selectedUser.createdAt) }}</Text>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Estado</Text>
            <Badge :variant="selectedUser.isActive ? 'success' : 'default'">
              {{ selectedUser.isActive ? 'Activo' : 'Inactivo' }}
            </Badge>
          </div>
          <div class="admin-users-page__panel-row">
            <Text size="xs" color="muted">Rol actual</Text>
            <Badge :variant="selectedUser.role === 'admin' ? 'danger' : 'default'">
              {{ selectedUser.role === 'admin' ? 'Admin' : 'Usuario' }}
            </Badge>
          </div>

          <div class="admin-users-page__panel-divider" />

          <div class="admin-users-page__panel-actions">
            <Text size="xs" weight="bold" color="default">Cambiar rol</Text>
            <div class="admin-users-page__panel-role-btns">
              <Button
                size="sm"
                :variant="selectedUser.role === 'admin' ? 'ghost' : 'primary'"
                :disabled="selectedUser.role === 'user'"
                @click="openRoleModal('user')"
              >
                Pasar a Usuario
              </Button>
              <Button
                size="sm"
                :variant="selectedUser.role === 'user' ? 'ghost' : 'danger'"
                :disabled="selectedUser.role === 'admin'"
                @click="openRoleModal('admin')"
              >
                Pasar a Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </USlideover>

    <!-- ── Modal confirmación cambio de rol ─────────────────────────────── -->
    <ModalWizard :show="showRoleModal">
      <div class="users-modal">
        <div class="users-modal__header">
          <Heading level="h3" size="lg" weight="semibold">Cambiar rol</Heading>
          <button type="button" class="users-modal__close" @click="cancelRoleChange">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <Text size="sm" color="muted">
          ¿Confirmas que deseas asignar el rol
          <strong>{{ pendingRole === 'admin' ? 'Administrador' : 'Usuario' }}</strong>
          a
          <strong>{{ selectedUser?.displayName }}</strong>
          ?
        </Text>
        <div class="users-modal__actions">
          <Button
            size="sm"
            :variant="pendingRole === 'admin' ? 'danger' : 'primary'"
            :disabled="isLoading"
            @click="confirmRoleChange"
          >
            Confirmar
          </Button>
          <Button size="sm" variant="ghost" @click="cancelRoleChange">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .admin-users-page {
    @apply space-y-4 px-4 py-2;
  }

  .admin-users-page__header {
    @apply flex items-center justify-between;
  }

  .admin-users-page__table-section {
    @apply rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800;
  }

  .admin-users-page__table-header {
    @apply flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-700;
  }

  .admin-users-page__filters {
    @apply flex flex-wrap items-end gap-3 border-b border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  .admin-users-page__search {
    @apply min-w-48 flex-1;
  }

  .admin-users-page__filter-selects {
    @apply flex items-end gap-3;
  }

  .admin-users-page__skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-users-page__table-wrapper {
    @apply overflow-x-auto;
  }

  .admin-users-page__table {
    @apply w-full text-left;
  }

  .admin-users-page__th {
    @apply border-b border-neutral-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400;
  }

  .admin-users-page__tr {
    @apply border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700;
  }

  .admin-users-page__td {
    @apply px-5 py-3;
  }

  .admin-users-page__td--empty {
    @apply px-5 py-12 text-center;
  }

  .admin-users-page__pagination {
    @apply flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700;
  }

  /* ── Panel ──────────────────────────────────────────────────────────── */
  .admin-users-page__panel-body {
    @apply p-4;
  }

  .admin-users-page__panel-skeleton {
    @apply h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .admin-users-page__panel-content {
    @apply space-y-4;
  }

  .admin-users-page__panel-row {
    @apply flex flex-col gap-1;
  }

  .admin-users-page__panel-divider {
    @apply border-t border-neutral-100 dark:border-neutral-700;
  }

  .admin-users-page__panel-actions {
    @apply flex flex-col gap-3;
  }

  .admin-users-page__panel-role-btns {
    @apply flex gap-2;
  }

  /* ── Modal ──────────────────────────────────────────────────────────── */
  .users-modal {
    @apply flex flex-col gap-5;
  }

  .users-modal__header {
    @apply flex items-center justify-between;
  }

  .users-modal__close {
    @apply flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-white;
  }

  .users-modal__actions {
    @apply flex items-center gap-2 pt-1;
  }
</style>
