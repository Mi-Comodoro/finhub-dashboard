<script setup lang="ts">
  import GroupExpenseForm from '@/components/business/groups/forms/GroupExpenseForm.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useFriendshipsApplication } from '@/composables/application/useFriendshipsApplication'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useAuthStore } from '@/stores/auth.store'
  import { useFriendshipsStore } from '@/stores/friendships.store'
  import type {
    ContributionSummary,
    GroupExpense,
    GroupMember,
    GroupStatus,
    GroupType,
    MemberRole
  } from '@/types/groups.types'
  import { formatCurrency } from '@/utils/currency'

  definePageMeta({
    layout: 'dashboard',
    title: 'Detalle de Grupo',
    breadcrumb: 'Detalle',
    parents: ['Grupos']
  })

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { success: successToast, error: errorToast } = useFeedback()

  const {
    selectedGroup,
    isLoading,
    fetchGroup,
    addMember,
    removeMember,
    deleteGroup,
    fetchContributions,
    fetchExpenses,
    createExpense,
    payExpense,
    markExpenseCxp
  } = useGroupsApplication()
  const { loadAll } = useFriendshipsApplication()
  const friendshipsStore = useFriendshipsStore()

  const groupId = computed(() => route.params.id as string)
  const currentUserId = computed(() => authStore.user?.id ?? '')

  // Reactive state for new data
  const contributions = ref<ContributionSummary | null>(null)
  const expenses = ref<GroupExpense[]>([])
  const isLoadingContributions = ref(false)
  const isLoadingExpenses = ref(false)

  // Current user role derived from group members
  const currentMember = computed(() =>
    selectedGroup.value?.members.find(m => m.userId === currentUserId.value)
  )
  const currentRole = computed<MemberRole | null>(() => currentMember.value?.role ?? null)
  const isOrganizer = computed(() => selectedGroup.value?.ownerId === currentUserId.value)
  const canManage = computed(
    () =>
      isOrganizer.value || currentRole.value === 'ORGANIZER' || currentRole.value === 'CO_ORGANIZER'
  )
  const isClosed = computed(() => selectedGroup.value?.status === 'Cerrado')

  // Active members for expense responsable select
  const activeMembers = computed<GroupMember[]>(
    () => selectedGroup.value?.members.filter(m => m.memberStatus === 'active') ?? []
  )

  // Friends available to invite
  const availableFriends = computed(() => {
    const memberIds = new Set(
      selectedGroup.value?.members.filter(m => m.userId).map(m => m.userId) ?? []
    )
    return friendshipsStore.friends.filter(f => !memberIds.has(f.friendUserId))
  })

  // Modal state
  const showInviteModal = ref(false)
  const invitingUserId = ref<string | null>(null)
  const showDeleteModal = ref(false)
  const isDeleting = ref(false)
  const showAddExpenseModal = ref(false)
  const showPayModal = ref(false)
  const expenseToPayId = ref<string | null>(null)
  const expenseToPay = computed(
    () => expenses.value.find(e => e.id === expenseToPayId.value) ?? null
  )

  // Label maps
  const typeLabels: Record<GroupType, string> = {
    SHARED: 'Compartido',
    FAMILIAR: 'Familiar',
    TRAVEL: 'Viaje'
  }
  const typeColors: Record<GroupType, string> = {
    SHARED: 'secondary',
    FAMILIAR: 'primary',
    TRAVEL: 'warning'
  }
  const statusColors: Record<GroupStatus, string> = {
    Planificando: 'neutral',
    Activo: 'success',
    Cerrado: 'danger'
  }
  const roleLabels: Record<MemberRole, string> = {
    ORGANIZER: 'Organizador',
    CO_ORGANIZER: 'Co-organizador',
    MEMBER: 'Miembro',
    VIEWER: 'Visualizador'
  }

  // Progress bar
  const progressPercent = computed(() => {
    if (!contributions.value?.goal || !contributions.value.totalContributed) return 0
    return Math.min(
      Math.round((contributions.value.totalContributed / contributions.value.goal) * 100),
      100
    )
  })

  // Expense badge logic
  const getExpenseBadge = (expense: GroupExpense) => {
    if (expense.status === 'paid') return { label: 'Pagado', color: 'success' }
    if (expense.status === 'cxp') return { label: 'CxP creada', color: 'warning' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(expense.dueDate)
    if (due <= today) return { label: 'Pendiente', color: 'warning' }
    return { label: 'Planificado', color: 'neutral' }
  }

  const isPending = (expense: GroupExpense) => {
    if (expense.status !== 'planned') return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(expense.dueDate) <= today
  }

  const canActOnExpense = (expense: GroupExpense) => {
    if (isClosed.value) return false
    if (expense.status === 'paid' || expense.status === 'cxp') return false
    if (!isPending(expense)) return false
    if (canManage.value) return true
    if (currentRole.value === 'MEMBER' && expense.responsibleUserId === currentUserId.value)
      return true
    return false
  }

  const getResponsibleHandle = (expense: GroupExpense) => {
    const member = selectedGroup.value?.members.find(m => m.userId === expense.responsibleUserId)
    return member?.handle ? `@${member.handle}` : expense.responsibleUserId.slice(0, 8)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Actions
  const handleInvite = async (userId: string) => {
    invitingUserId.value = userId
    try {
      const { success } = await addMember(groupId.value, { userId })
      if (success) {
        successToast('Miembro invitado', 'El miembro fue agregado al grupo.')
        showInviteModal.value = false
      } else {
        errorToast('Error', 'No se pudo agregar el miembro.')
      }
    } finally {
      invitingUserId.value = null
    }
  }

  const handleLeave = async () => {
    const { success } = await removeMember(groupId.value, currentUserId.value)
    if (success) {
      successToast('Saliste del grupo', 'Ya no eres miembro de este grupo.')
      router.push('/dashboard/groups')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    const { success } = await removeMember(groupId.value, userId)
    if (success) successToast('Miembro eliminado', 'El miembro fue removido del grupo.')
  }

  const handleDeleteGroup = async () => {
    isDeleting.value = true
    try {
      const { success } = await deleteGroup(groupId.value)
      if (success) {
        successToast('Grupo eliminado', 'El grupo fue eliminado correctamente.')
        router.push('/dashboard/groups')
      }
    } finally {
      isDeleting.value = false
      showDeleteModal.value = false
    }
  }

  const handleExpenseCreated = (expense: GroupExpense) => {
    expenses.value.push(expense)
    showAddExpenseModal.value = false
    successToast('Gasto agregado', 'El gasto fue agregado al plan del grupo.')
  }

  const openPayModal = (expenseId: string) => {
    expenseToPayId.value = expenseId
    showPayModal.value = true
  }

  const handlePay = async () => {
    if (!expenseToPayId.value) return
    const { success, data } = await payExpense(groupId.value, expenseToPayId.value)
    if (success && data) {
      const idx = expenses.value.findIndex(e => e.id === expenseToPayId.value)
      if (idx !== -1) expenses.value[idx] = data
      successToast('Gasto pagado', 'El gasto fue marcado como pagado.')
    } else {
      errorToast('Error', 'No se pudo registrar el pago.')
    }
    showPayModal.value = false
    expenseToPayId.value = null
  }

  const handleMarkCxp = async (expenseId: string) => {
    const { success, data } = await markExpenseCxp(groupId.value, expenseId)
    if (success && data) {
      const idx = expenses.value.findIndex(e => e.id === expenseId)
      if (idx !== -1) expenses.value[idx] = data
      successToast('CxP creada', 'Se creó la cuenta por pagar para el gasto.')
    } else {
      errorToast('Error', 'No se pudo crear la cuenta por pagar.')
    }
  }

  const loadGroupData = async () => {
    await fetchGroup(groupId.value)

    isLoadingContributions.value = true
    isLoadingExpenses.value = true

    const [contribResult, expensesResult] = await Promise.all([
      fetchContributions(groupId.value),
      fetchExpenses(groupId.value)
    ])

    if (contribResult.success && contribResult.data) contributions.value = contribResult.data
    if (expensesResult.success && expensesResult.data) expenses.value = expensesResult.data

    isLoadingContributions.value = false
    isLoadingExpenses.value = false
  }

  onMounted(async () => {
    await Promise.all([loadGroupData(), loadAll()])
  })
</script>

<template>
  <div class="group-detail">
    <!-- Loading skeleton -->
    <template v-if="isLoading && !selectedGroup">
      <div class="group-detail__skeleton-header" />
      <div class="group-detail__skeleton-block" />
      <div class="group-detail__skeleton-block" />
    </template>

    <template v-else-if="selectedGroup">
      <!-- Closed group banner -->
      <div v-if="isClosed" class="group-detail__closed-banner">
        <span class="material-symbols-outlined group-detail__closed-icon">lock</span>
        <Text size="sm">Este grupo está cerrado. Solo puedes consultar el historial.</Text>
      </div>

      <!-- BLOQUE 1: HEADER -->
      <div class="group-detail__header">
        <div class="group-detail__header-info">
          <div class="group-detail__title-row">
            <Heading level="h1" size="2xl" weight="extrabold">
              {{ selectedGroup.name }}
            </Heading>
            <UBadge
              :label="selectedGroup.status"
              :color="statusColors[selectedGroup.status]"
              variant="subtle"
              size="sm"
            />
            <UBadge
              :label="typeLabels[selectedGroup.type]"
              :color="typeColors[selectedGroup.type]"
              variant="subtle"
              size="sm"
            />
          </div>

          <div class="group-detail__header-meta">
            <Text
              v-if="selectedGroup.type === 'TRAVEL' && selectedGroup.destination"
              size="xs"
              color="muted"
            >
              <span class="material-symbols-outlined group-detail__meta-icon">location_on</span>
              {{ selectedGroup.destination }}
            </Text>
            <Text v-if="selectedGroup.estimatedDate" size="xs" color="muted">
              <span class="material-symbols-outlined group-detail__meta-icon">calendar_month</span>
              {{ formatDate(selectedGroup.estimatedDate) }}
            </Text>
          </div>
        </div>

        <div class="group-detail__header-actions">
          <Button
            v-if="canManage && !isClosed"
            variant="primary"
            size="sm"
            icon="add"
            @click="showAddExpenseModal = true"
          >
            Agregar gasto
          </Button>
          <Button
            v-if="canManage && !isClosed"
            variant="ghost"
            size="sm"
            icon="person_add"
            @click="showInviteModal = true"
          >
            Invitar
          </Button>
          <Button v-if="!isOrganizer" variant="ghost" size="sm" icon="logout" @click="handleLeave">
            Salir
          </Button>
          <Button
            v-if="isOrganizer && !isClosed"
            variant="danger"
            size="sm"
            icon="delete"
            @click="showDeleteModal = true"
          >
            Eliminar
          </Button>
        </div>
      </div>

      <!-- BLOQUE 2: PROGRESO DEL OBJETIVO (only if goal is set) -->
      <Card v-if="contributions?.goal != null" class="group-detail__contributions-card">
        <div class="group-detail__section-header">
          <Heading level="h3" size="lg" weight="semibold">Progreso del objetivo</Heading>
        </div>

        <!-- Progress bar -->
        <div class="group-detail__progress-section">
          <div class="group-detail__progress-labels">
            <Text size="sm" weight="medium">
              {{ formatCurrency(contributions.totalContributed, 'COP') }} /
              {{ formatCurrency(contributions.goal, 'COP') }}
            </Text>
            <Text size="sm" weight="semibold" class="group-detail__progress-percent">
              {{ progressPercent }}%
            </Text>
          </div>
          <UProgress
            :value="progressPercent"
            :color="isClosed ? 'neutral' : 'primary'"
            size="md"
            class="group-detail__progress-bar"
          />
        </div>

        <!-- Skeleton for contributions -->
        <div v-if="isLoadingContributions" class="group-detail__contributions-skeleton">
          <div v-for="i in 3" :key="i" class="group-detail__skeleton-member" />
        </div>

        <!-- Members contribution list -->
        <ul v-else class="group-detail__contributions-list">
          <li
            v-for="member in contributions.members"
            :key="member.userId ?? member.externalName ?? 'unknown'"
            class="group-detail__contribution-row"
          >
            <!-- Avatar -->
            <div
              class="group-detail__member-avatar"
              :class="{
                'group-detail__member-avatar--external': member.memberStatus === 'external',
                'group-detail__member-avatar--invited': member.memberStatus === 'invited'
              }"
            >
              <span v-if="member.memberStatus === 'external'" class="material-symbols-outlined">
                person_off
              </span>
              <span v-else-if="member.memberStatus === 'invited'" class="material-symbols-outlined">
                mail
              </span>
              <span v-else class="material-symbols-outlined">person</span>
            </div>

            <!-- Info -->
            <div class="group-detail__contribution-info">
              <div class="group-detail__contribution-name-row">
                <Text size="sm" weight="medium">
                  {{ member.handle ? `@${member.handle}` : (member.externalName ?? '—') }}
                </Text>
                <Text size="xs" color="muted">{{ roleLabels[member.role] }}</Text>
              </div>

              <!-- Member status-specific content -->
              <div
                v-if="member.memberStatus === 'invited'"
                class="group-detail__contribution-status"
              >
                <UBadge label="Invitación enviada" color="secondary" variant="subtle" size="xs" />
              </div>
              <div
                v-else-if="member.memberStatus === 'external'"
                class="group-detail__contribution-status"
              >
                <Text size="xs" color="muted">Externo — gestión del organizador</Text>
              </div>
              <div v-else class="group-detail__contribution-amounts">
                <Text v-if="member.totalAmount > 0" size="sm" weight="medium">
                  {{ formatCurrency(member.totalAmount, 'COP') }}
                  · {{ member.percentage }}%
                </Text>
                <Text v-else size="sm" color="muted">{{ formatCurrency(0, 'COP') }} · 0%</Text>
                <Text v-if="member.budgetLabel" size="xs" color="muted">
                  Presupuesto: {{ member.budgetLabel }}
                </Text>
                <Text v-else-if="member.totalAmount === 0" size="xs" color="muted">
                  Sin aportes aún
                </Text>
              </div>
            </div>
          </li>
        </ul>
      </Card>

      <!-- BLOQUE 3: GASTOS DEL PLAN -->
      <Card class="group-detail__expenses-card">
        <div class="group-detail__section-header">
          <Heading level="h3" size="lg" weight="semibold">Gastos del plan</Heading>
        </div>

        <!-- Skeleton -->
        <div v-if="isLoadingExpenses" class="group-detail__expenses-skeleton">
          <div v-for="i in 3" :key="i" class="group-detail__skeleton-expense" />
        </div>

        <!-- Empty state -->
        <div v-else-if="expenses.length === 0" class="group-detail__expenses-empty">
          <EmptyStateIllustration type="no-transactions" class="group-detail__empty-illustration" />
          <Heading level="h3" size="lg" weight="semibold">Sin gastos planificados</Heading>
          <Text size="sm" color="muted">Agrega los gastos del grupo para hacer seguimiento.</Text>
          <Button
            v-if="canManage && !isClosed"
            variant="primary"
            size="sm"
            icon="add"
            @click="showAddExpenseModal = true"
          >
            Agregar gasto
          </Button>
        </div>

        <!-- Expenses list -->
        <ul v-else class="group-detail__expenses-list">
          <li v-for="expense in expenses" :key="expense.id" class="group-detail__expense-row">
            <!-- Icon -->
            <div class="group-detail__expense-icon">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>

            <!-- Description + date + responsible -->
            <div class="group-detail__expense-info">
              <Text size="sm" weight="medium">{{ expense.description }}</Text>
              <div class="group-detail__expense-meta">
                <Text size="xs" color="muted">
                  <span class="material-symbols-outlined group-detail__meta-icon">
                    calendar_today
                  </span>
                  {{ formatDate(expense.dueDate) }}
                </Text>
                <Text size="xs" color="muted">
                  <span class="material-symbols-outlined group-detail__meta-icon">person</span>
                  {{ getResponsibleHandle(expense) }}
                </Text>
              </div>
            </div>

            <!-- Amount -->
            <Text size="sm" weight="semibold" class="group-detail__expense-amount">
              {{ formatCurrency(expense.amount, 'COP') }}
            </Text>

            <!-- Badge -->
            <UBadge
              :label="getExpenseBadge(expense).label"
              :color="getExpenseBadge(expense).color as any"
              variant="subtle"
              size="sm"
            />

            <!-- Actions (desktop) -->
            <div class="group-detail__expense-actions group-detail__expense-actions--desktop">
              <template v-if="canActOnExpense(expense)">
                <Button variant="primary" size="sm" @click="openPayModal(expense.id)">Pagar</Button>
                <Button variant="ghost" size="sm" @click="handleMarkCxp(expense.id)">CxP</Button>
              </template>
              <Text
                v-else-if="expense.status === 'paid' && expense.transactionId"
                size="xs"
                color="muted"
              >
                → Transacción
              </Text>
              <Text v-else-if="expense.status === 'cxp' && expense.cxpId" size="xs" color="muted">
                → CxP
              </Text>
            </div>

            <!-- Kebab menu (mobile) -->
            <div
              v-if="canActOnExpense(expense)"
              class="group-detail__expense-actions group-detail__expense-actions--mobile"
            >
              <UPopover>
                <Button variant="ghost" size="sm" icon="more_vert" :icon-only="true" />
                <template #content>
                  <div class="group-detail__kebab-menu">
                    <button class="group-detail__kebab-item" @click="openPayModal(expense.id)">
                      <span class="material-symbols-outlined">payments</span>
                      Pagar
                    </button>
                    <button class="group-detail__kebab-item" @click="handleMarkCxp(expense.id)">
                      <span class="material-symbols-outlined">description</span>
                      Crear CxP
                    </button>
                  </div>
                </template>
              </UPopover>
            </div>
          </li>
        </ul>
      </Card>
    </template>

    <!-- MODAL: Agregar gasto -->
    <ModalWizard :show="showAddExpenseModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Agregar gasto"
          sub-title="Define el gasto para el plan del grupo."
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="receipt_long"
          icon-size="md"
          icon-variant="primary"
        />
        <GroupExpenseForm
          :group-id="groupId"
          :members="activeMembers"
          @on-success="handleExpenseCreated"
          @on-close="showAddExpenseModal = false"
        />
      </div>
    </ModalWizard>

    <!-- MODAL: Confirmar pago -->
    <ModalWizard :show="showPayModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Confirmar pago"
          sub-title="¿Confirmas el pago de este gasto?"
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="payments"
          icon-size="md"
          icon-variant="primary"
        />
        <div v-if="expenseToPay" class="group-detail__pay-details">
          <Text size="sm" color="muted">
            Gasto:
            <strong>{{ expenseToPay.description }}</strong>
          </Text>
          <Text size="lg" weight="bold">{{ formatCurrency(expenseToPay.amount, 'COP') }}</Text>
        </div>
        <div class="group-detail__modal-actions">
          <Button
            variant="ghost"
            size="sm"
            @click="
              showPayModal = false
              expenseToPayId = null
            "
          >
            Cancelar
          </Button>
          <Button variant="primary" size="sm" @click="handlePay">Confirmar pago</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- MODAL: Invitar miembro -->
    <ModalWizard :show="showInviteModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Invitar Miembro"
          sub-title="Selecciona un amigo para agregar al grupo."
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="person_add"
          icon-size="md"
          icon-variant="primary"
        />
        <div v-if="availableFriends.length === 0" class="group-detail__invite-empty">
          <span class="material-symbols-outlined group-detail__invite-empty-icon">group</span>
          <Text size="sm" color="muted">
            Todos tus amigos ya son miembros o no tienes amigos aún.
          </Text>
        </div>
        <ul v-else class="group-detail__friends-list">
          <li
            v-for="friend in availableFriends"
            :key="friend.friendshipId"
            class="group-detail__friend-row"
          >
            <div class="group-detail__friend-avatar">
              {{ (friend.displayName ?? friend.handle ?? '?')[0].toUpperCase() }}
            </div>
            <div class="group-detail__friend-info">
              <Text size="sm" weight="medium">
                {{ friend.displayName ?? friend.handle ?? friend.friendUserId }}
              </Text>
              <Text v-if="friend.handle" size="xs" color="muted">@{{ friend.handle }}</Text>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              :disabled="invitingUserId === friend.friendUserId"
              @click="handleInvite(friend.friendUserId)"
            >
              {{ invitingUserId === friend.friendUserId ? 'Invitando...' : 'Invitar' }}
            </Button>
          </li>
        </ul>
        <div class="group-detail__modal-actions group-detail__modal-actions--end">
          <Button variant="ghost" size="sm" @click="showInviteModal = false">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- MODAL: Eliminar grupo -->
    <ModalWizard :show="showDeleteModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Eliminar Grupo"
          sub-title="Esta acción no se puede deshacer."
          title-size="xl"
          weight="extrabold"
          level="h1"
          color="black"
          sub-title-size="xs"
          sub-title-color="muted"
          icon="delete"
          icon-size="md"
          icon-variant="primary"
        />
        <Text size="sm" color="muted">
          ¿Estás seguro de eliminar el grupo
          <strong>{{ selectedGroup?.name }}</strong>
          ? Todos los miembros perderán acceso.
        </Text>
        <div class="group-detail__modal-actions">
          <Button variant="ghost" size="sm" @click="showDeleteModal = false">Cancelar</Button>
          <Button variant="danger" size="sm" :disabled="isDeleting" @click="handleDeleteGroup">
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </Button>
        </div>
      </div>
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .group-detail {
    @apply space-y-4;
  }

  .group-detail__skeleton-header {
    @apply h-20 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .group-detail__skeleton-block {
    @apply h-48 w-full animate-pulse rounded-xl bg-slate-100;
  }

  .group-detail__skeleton-member {
    @apply h-12 w-full animate-pulse rounded-lg bg-slate-100;
  }

  .group-detail__skeleton-expense {
    @apply h-16 w-full animate-pulse rounded-lg bg-slate-100;
  }

  .group-detail__closed-banner {
    @apply flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3;
    @apply dark:border-danger-800 dark:bg-danger-900/20;
  }

  .group-detail__closed-icon {
    @apply text-xl text-danger-500;
  }

  /* HEADER */
  .group-detail__header {
    @apply flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between;
  }

  .group-detail__header-info {
    @apply flex flex-col gap-2;
  }

  .group-detail__title-row {
    @apply flex flex-wrap items-center gap-3;
  }

  .group-detail__header-meta {
    @apply flex flex-wrap items-center gap-4;
  }

  .group-detail__meta-icon {
    @apply mr-1 align-middle text-base;
  }

  .group-detail__header-actions {
    @apply flex flex-shrink-0 flex-wrap gap-2;
  }

  /* CARDS */
  .group-detail__contributions-card {
    @apply !p-5;
  }

  .group-detail__expenses-card {
    @apply !p-5;
  }

  .group-detail__section-header {
    @apply mb-4;
  }

  /* PROGRESS */
  .group-detail__progress-section {
    @apply mb-4 space-y-2;
  }

  .group-detail__progress-labels {
    @apply flex items-center justify-between;
  }

  .group-detail__progress-percent {
    @apply text-primary-600 dark:text-primary-400;
  }

  .group-detail__progress-bar {
    @apply w-full;
  }

  /* CONTRIBUTIONS LIST */
  .group-detail__contributions-skeleton {
    @apply space-y-2;
  }

  .group-detail__contributions-list {
    @apply divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__contribution-row {
    @apply flex items-start gap-3 py-3;
  }

  .group-detail__member-avatar {
    @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full;
    @apply bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300;
  }

  .group-detail__contribution-info {
    @apply flex flex-1 flex-col gap-1;
  }

  .group-detail__contribution-name-row {
    @apply flex flex-wrap items-center gap-2;
  }

  .group-detail__contribution-amounts {
    @apply flex flex-wrap gap-3;
  }

  .group-detail__contribution-status {
    @apply mt-0.5;
  }

  /* EXPENSES */
  .group-detail__expenses-skeleton {
    @apply space-y-2;
  }

  .group-detail__expenses-empty {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .group-detail__empty-illustration {
    @apply mx-auto h-32 w-32;
  }

  .group-detail__expenses-list {
    @apply divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__expense-row {
    @apply flex flex-wrap items-center gap-3 py-3 md:flex-nowrap;
  }

  .group-detail__expense-icon {
    @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full;
    @apply bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300;
  }

  .group-detail__expense-info {
    @apply flex min-w-0 flex-1 flex-col gap-0.5;
  }

  .group-detail__expense-meta {
    @apply flex flex-wrap gap-3;
  }

  .group-detail__expense-amount {
    @apply shrink-0 text-right;
  }

  .group-detail__expense-actions {
    @apply flex shrink-0 items-center gap-2;
  }

  .group-detail__expense-actions--desktop {
    @apply hidden md:flex;
  }

  .group-detail__expense-actions--mobile {
    @apply flex md:hidden;
  }

  /* MODALS */
  .group-detail__modal {
    @apply flex flex-col gap-4;
  }

  .group-detail__pay-details {
    @apply flex flex-col gap-1 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .group-detail__modal-actions {
    @apply flex justify-end gap-2;
  }

  .group-detail__invite-empty {
    @apply flex flex-col items-center gap-2 rounded-xl border border-neutral-100 py-8 text-center;
    @apply dark:border-neutral-700;
  }

  .group-detail__invite-empty-icon {
    @apply text-4xl text-neutral-300;
  }

  .group-detail__friends-list {
    @apply max-h-64 divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-200;
    @apply dark:divide-neutral-700 dark:border-neutral-700;
  }

  .group-detail__friend-row {
    @apply flex items-center gap-3 px-4 py-3;
  }

  .group-detail__friend-avatar {
    @apply flex h-9 w-9 shrink-0 items-center justify-center rounded-full;
    @apply bg-primary-100 text-sm font-bold text-primary-700;
    @apply dark:bg-primary-900/30 dark:text-primary-300;
  }

  .group-detail__friend-info {
    @apply flex flex-1 flex-col;
  }

  /* KEBAB */
  .group-detail__kebab-menu {
    @apply flex flex-col py-1;
  }

  .group-detail__kebab-item {
    @apply flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50;
    @apply dark:hover:bg-neutral-700;
  }
</style>
