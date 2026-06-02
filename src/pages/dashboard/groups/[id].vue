<script setup lang="ts">
  import { PieChart } from 'echarts/charts'
  import { GraphicComponent, TooltipComponent } from 'echarts/components'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import VueECharts from 'vue-echarts'

  import Badge from '@/components/atoms/badge/Badge.vue'
  import IconBadge from '@/components/atoms/icons/IconBadge.vue'
  import ExpensePlannedForm from '@/components/business/expense/forms/ExpensePlannedForm.vue'
  import GroupExpenseForm from '@/components/business/groups/forms/GroupExpenseForm.vue'
  import GroupForm from '@/components/business/groups/forms/GroupForm.vue'
  import ProgressBar from '@/components/molecules/progress-bar/ProgressBar.vue'
  import DataTable from '@/components/organisms/datatable/DataTable.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useExpenseApi } from '@/composables/api/useExpenseApi'
  import { useBudgetActions } from '@/composables/application/useBudgetActions'
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { useFriendshipsApplication } from '@/composables/application/useFriendshipsApplication'
  import { useGroupsApplication } from '@/composables/application/useGroupsApplication'
  import { useCommon } from '@/composables/useCommon'
  import { useFeedback } from '@/composables/useFeedBack'
  import { useAuthStore } from '@/stores/auth.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { useFriendshipsStore } from '@/stores/friendships.store'
  import type {
    ContributionSummary,
    GroupBudgetProgress,
    GroupExpense,
    GroupMember,
    GroupStatus,
    GroupType,
    MemberRole
  } from '@/types/groups.types'
  import { formatCurrency } from '@/utils/currency'

  use([CanvasRenderer, PieChart, TooltipComponent, GraphicComponent])

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
    fetchGroupBudgetProgress,
    createExpense,
    updateExpense,
    payExpense,
    markExpenseCxp,
    inviteWithContext
  } = useGroupsApplication()
  const { loadAll } = useFriendshipsApplication()
  const { fetchCurrentBudget } = useBudgetActions()
  const friendshipsStore = useFriendshipsStore()
  const financesStore = useFinancesStore()
  const { currentBudget } = useCommon()

  const groupId = computed(() => route.params.id as string)
  const currentUserId = computed(() => authStore.user?.id ?? '')

  // Reactive state for new data
  const contributions = ref<ContributionSummary | null>(null)
  const expenses = ref<GroupExpense[]>([])
  const budgetProgress = ref<GroupBudgetProgress | null>(null)
  const isLoadingContributions = ref(false)
  const isLoadingExpenses = ref(false)
  const isLoadingBudgetProgress = ref(false)

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

  const { updateExpense: updatePlannedExpense } = useExpenseApplication()
  const expenseApi = useExpenseApi()

  // Budget expenses for the link-expense modal
  type BudgetExpenseRow = {
    id: string
    name: string
    expectedAmount: number
    dueDate: Date | string
    status: string
    category: string
    bucket: string
  }
  const budgetExpenses = ref<BudgetExpenseRow[]>([])
  const isLoadingBudgetExpenses = ref(false)
  const linkingExpenseId = ref<string | null>(null)
  const showCreateExpenseInModal = ref(false)

  const loadBudgetExpenses = async () => {
    if (!currentBudget.value?.id) return
    isLoadingBudgetExpenses.value = true
    try {
      const { result } = await expenseApi.findAllExpenses({
        budgetId: currentBudget.value.id,
        status: 'PLANNED',
        limit: 50
      })
      budgetExpenses.value = result.data.filter(
        e => !budgetProgress.value?.expenses.some(linked => linked.id === e.id)
      )
    } catch {
      budgetExpenses.value = []
    } finally {
      isLoadingBudgetExpenses.value = false
    }
  }

  const openLinkExpenseModal = async () => {
    showCreateExpenseInModal.value = false
    budgetExpenses.value = []
    showLinkExpenseModal.value = true
    await loadBudgetExpenses()
  }

  const closeLinkExpenseModal = () => {
    showLinkExpenseModal.value = false
    showCreateExpenseInModal.value = false
    budgetExpenses.value = []
  }

  const handleLinkExisting = async (expenseId: string) => {
    linkingExpenseId.value = expenseId
    try {
      const { success } = await updatePlannedExpense(expenseId, { groupId: groupId.value })
      if (success) {
        await handleExpenseLinked()
        await loadBudgetExpenses()
      } else {
        errorToast('Error', 'No se pudo vincular el gasto.')
      }
    } finally {
      linkingExpenseId.value = null
    }
  }

  // Modal state
  const showInviteModal = ref(false)
  const invitingUserId = ref<string | null>(null)
  const showDeleteModal = ref(false)
  const isDeleting = ref(false)
  const showAddExpenseModal = ref(false)
  const showPayModal = ref(false)
  const showGoalModal = ref(false)
  const showLinkExpenseModal = ref(false)
  const expenseToPayId = ref<string | null>(null)
  const expenseToPay = computed(
    () => expenses.value.find(e => e.id === expenseToPayId.value) ?? null
  )

  const showExpenseDetailModal = ref(false)
  const selectedExpenseId = ref<string | null>(null)
  const selectedExpense = computed(
    () => expenses.value.find(e => e.id === selectedExpenseId.value) ?? null
  )

  const showEditExpenseModal = ref(false)
  const expenseToEditId = ref<string | null>(null)
  const expenseToEdit = computed(
    () => expenses.value.find(e => e.id === expenseToEditId.value) ?? null
  )
  const expenseToEditInitialData = computed(() => {
    const e = expenseToEdit.value
    if (!e) return undefined
    return {
      description: e.description,
      amount: e.amount,
      dueDate: typeof e.dueDate === 'string' ? e.dueDate.split('T')[0] : String(e.dueDate),
      responsibleUserId: e.responsibleUserId
    }
  })

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
    Planificando: 'default',
    Activo: 'success',
    Cerrado: 'danger'
  }
  const roleLabels: Record<MemberRole, string> = {
    ORGANIZER: 'Organizador',
    CO_ORGANIZER: 'Co-organizador',
    MEMBER: 'Miembro',
    VIEWER: 'Visualizador'
  }

  // Member count
  const activeMemberCount = computed(
    () => selectedGroup.value?.members.filter(m => m.memberStatus === 'active').length ?? 0
  )
  const maxMembersCount = computed(() => selectedGroup.value?.maxMembers ?? 0)

  // Expense metrics
  const totalExpensesAmount = computed(() =>
    expenses.value.reduce((sum, e) => sum + Number(e.amount), 0)
  )
  const paidExpensesAmount = computed(() =>
    expenses.value.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0)
  )
  const pendingExpensesAmount = computed(() =>
    expenses.value.filter(e => e.status !== 'paid').reduce((sum, e) => sum + Number(e.amount), 0)
  )
  const expensesPaidPercent = computed(() =>
    totalExpensesAmount.value > 0
      ? Math.round((paidExpensesAmount.value / totalExpensesAmount.value) * 100)
      : 0
  )
  const paidExpensesCount = computed(() => expenses.value.filter(e => e.status === 'paid').length)

  // Progress bar (contributions)
  const progressPercent = computed(() => {
    if (!contributions.value?.goal || !contributions.value.totalContributed) return 0
    return Math.min(
      Math.round((contributions.value.totalContributed / contributions.value.goal) * 100),
      100
    )
  })

  // Budget progress (planned expenses linked to group)
  const budgetProgressPercent = computed(() => {
    if (!budgetProgress.value?.goal || !budgetProgress.value.totalLinked) return 0
    return Math.min(
      Math.round((budgetProgress.value.totalLinked / budgetProgress.value.goal) * 100),
      100
    )
  })

  const isTravelGroup = computed(() => selectedGroup.value?.type === 'TRAVEL')

  // Expense badge logic
  const getExpenseBadge = (expense: GroupExpense) => {
    if (expense.status === 'paid') return { label: 'Pagado', color: 'success' }
    if (expense.status === 'cxp') return { label: 'CxP creada', color: 'warning' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(expense.dueDate)
    if (due <= today) return { label: 'Pendiente', color: 'warning' }
    return { label: 'Planificado', color: 'default' }
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
    if (!member) return expense.responsibleUserId.slice(0, 8)
    if (member.handle) return `@${member.handle}`
    return member.displayName ?? member.externalName ?? expense.responsibleUserId.slice(0, 8)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Organizer's linked expense amount (to send as context on trip invitations)
  const organizerLinkedAmount = computed(() => {
    if (!isTravelGroup.value || !budgetProgress.value) return undefined
    const ownExpenses = budgetProgress.value.expenses.filter(e => e.userId === currentUserId.value)
    if (!ownExpenses.length) return undefined
    return ownExpenses.reduce((sum, e) => sum + e.expectedAmount, 0)
  })

  // Per-member linked amounts map (userId → total linked)
  const memberLinkedAmounts = computed<Record<string, number>>(() => {
    if (!budgetProgress.value) return {}
    return budgetProgress.value.expenses.reduce(
      (acc, e) => {
        if (e.userId) acc[e.userId] = (acc[e.userId] ?? 0) + e.expectedAmount
        return acc
      },
      {} as Record<string, number>
    )
  })

  // Hide CxP button when contributions cover total group expenses (no debt needed)
  const hideCxpButton = computed(
    () =>
      isTravelGroup.value &&
      (budgetProgress.value?.totalLinked ?? 0) > 0 &&
      totalExpensesAmount.value <= (budgetProgress.value?.totalLinked ?? 0)
  )

  // Display name lookup: prefers displayName from selectedGroup members, falls back to handle
  const memberDisplayName = computed<Record<string, string>>(() => {
    if (!selectedGroup.value) return {}
    return Object.fromEntries(
      selectedGroup.value.members
        .filter(m => m.userId)
        .map(m => [m.userId!, m.displayName ?? (m.handle ? `@${m.handle}` : m.userId!)])
    )
  })

  const organizerDisplayName = computed(() => {
    if (!selectedGroup.value) return null
    const org = selectedGroup.value.members.find(m => m.userId === selectedGroup.value!.ownerId)
    return org?.displayName ?? (org?.handle ? `@${org.handle}` : null)
  })

  const expenseTableColumns = [
    { key: 'description', label: 'Descripción' },
    { key: 'responsible', label: 'Responsable' },
    { key: 'dueDate', label: 'Fecha', type: 'date' as const },
    {
      key: 'amount',
      label: 'Monto',
      type: 'currency' as const,
      align: 'right' as const,
      bold: true
    },
    { key: 'status', label: 'Estado', align: 'center' as const }
  ]

  const expenseTableData = computed(() =>
    expenses.value.map(e => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isPendingRow = e.status === 'planned' && new Date(e.dueDate) <= today
      const canAct =
        !isClosed.value &&
        e.status !== 'paid' &&
        e.status !== 'cxp' &&
        isPendingRow &&
        (canManage.value ||
          (currentRole.value === 'MEMBER' && e.responsibleUserId === currentUserId.value))
      return {
        id: e.id,
        description: e.description,
        responsible: getResponsibleHandle(e),
        dueDate: typeof e.dueDate === 'string' ? e.dueDate : String(e.dueDate),
        amount: e.amount,
        status: e.status,
        responsibleUserId: e.responsibleUserId,
        canAct,
        canEdit: canManage.value && e.status === 'planned' && !isClosed.value
      }
    })
  )

  const getRowExpenseBadge = (row: { status: string; dueDate: string }) => {
    if (row.status === 'paid') return { label: 'Pagado', color: 'success' }
    if (row.status === 'cxp') return { label: 'CxP creada', color: 'warning' }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(row.dueDate) <= today) return { label: 'Pendiente', color: 'warning' }
    return { label: 'Planificado', color: 'default' }
  }

  const travelDonutOption = computed(() => {
    const linked = budgetProgress.value?.totalLinked ?? 0
    const goal = budgetProgress.value?.goal ?? 0
    const remaining = Math.max(0, goal - linked)
    const pct = goal > 0 ? Math.min(Math.round((linked / goal) * 100), 100) : 0
    const label = goal > 0 ? `${pct}%` : 'Sin meta'

    const seriesData =
      goal > 0
        ? [
            { value: linked, name: 'Aportado', itemStyle: { color: '#f59e0b' } },
            {
              value: remaining > 0 ? remaining : 0.001,
              name: 'Falta',
              itemStyle: { color: '#e2e8f0' }
            }
          ]
        : [{ value: 1, name: 'Sin meta', itemStyle: { color: '#e2e8f0' } }]

    return {
      tooltip: { show: false },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: { text: label, fontSize: 18, fontWeight: 'bold', fill: '#374151' }
        }
      ],
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['50%', '50%'],
          data: seriesData,
          label: { show: false },
          emphasis: { disabled: true },
          silent: true,
          cursor: 'default'
        }
      ]
    }
  })

  // Actions
  const handleInvite = async (userId: string, withContext = false) => {
    invitingUserId.value = userId
    try {
      const fn = withContext && isTravelGroup.value ? inviteWithContext : addMember
      const dto =
        withContext && isTravelGroup.value
          ? { userId, plannedAmount: organizerLinkedAmount.value }
          : { userId }
      const { success } = await fn(groupId.value, dto as any)
      if (success) {
        successToast('Miembro invitado', 'La invitación fue enviada.')
        showInviteModal.value = false
      } else {
        errorToast('Error', 'No se pudo enviar la invitación.')
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
  }

  const handleExpenseUpdated = (expense: GroupExpense) => {
    const idx = expenses.value.findIndex(e => e.id === expense.id)
    if (idx !== -1) expenses.value[idx] = expense
    showEditExpenseModal.value = false
    expenseToEditId.value = null
  }

  const openExpenseDetail = (expenseId: string) => {
    selectedExpenseId.value = expenseId
    showExpenseDetailModal.value = true
  }

  const openEditExpense = (expenseId: string) => {
    expenseToEditId.value = expenseId
    showEditExpenseModal.value = true
  }

  const openPayModal = (expenseId: string) => {
    expenseToPayId.value = expenseId
    showPayModal.value = true
  }

  const closePayModal = () => {
    showPayModal.value = false
    expenseToPayId.value = null
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
    closePayModal()
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

  const handleExpenseLinked = async () => {
    showLinkExpenseModal.value = false
    isLoadingBudgetProgress.value = true
    const result = await fetchGroupBudgetProgress(groupId.value)
    if (result.success && result.data) budgetProgress.value = result.data
    isLoadingBudgetProgress.value = false
    successToast('Gasto vinculado', 'El gasto fue vinculado al grupo correctamente.')
  }

  const handleGoalSaved = async () => {
    showGoalModal.value = false
    await fetchGroup(groupId.value)
    const result = await fetchGroupBudgetProgress(groupId.value)
    if (result.success && result.data) budgetProgress.value = result.data
    successToast('Meta guardada', 'La meta monetaria del grupo fue actualizada.')
  }

  const loadGroupData = async () => {
    await fetchGroup(groupId.value)

    isLoadingContributions.value = true
    isLoadingExpenses.value = true
    isLoadingBudgetProgress.value = true

    const [contribResult, expensesResult, progressResult] = await Promise.all([
      fetchContributions(groupId.value),
      fetchExpenses(groupId.value),
      fetchGroupBudgetProgress(groupId.value)
    ])

    if (contribResult.success && contribResult.data) contributions.value = contribResult.data
    if (expensesResult.success && expensesResult.data) expenses.value = expensesResult.data
    if (progressResult.success && progressResult.data) budgetProgress.value = progressResult.data

    isLoadingContributions.value = false
    isLoadingExpenses.value = false
    isLoadingBudgetProgress.value = false
  }

  const refreshBudgetProgress = async () => {
    if (!groupId.value) return
    const result = await fetchGroupBudgetProgress(groupId.value)
    if (result.success && result.data) budgetProgress.value = result.data
  }

  const handleVisibilityChange = () => {
    if (!document.hidden) refreshBudgetProgress()
  }

  onMounted(async () => {
    await Promise.all([
      loadGroupData(),
      loadAll(),
      fetchCurrentBudget(financesStore.profile?.id ?? '')
    ])
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
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
            <Badge :variant="statusColors[selectedGroup.status] as any" size="sm">
              {{ selectedGroup.status }}
            </Badge>
            <Badge :variant="typeColors[selectedGroup.type] as any" size="sm">
              {{ typeLabels[selectedGroup.type] }}
            </Badge>
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
            <div class="group-detail__member-chip">
              <span class="material-symbols-outlined group-detail__meta-icon">group</span>
              <Text size="xs" color="muted">
                {{ activeMemberCount }} / {{ maxMembersCount }} miembros
              </Text>
              <Badge
                :variant="(activeMemberCount >= maxMembersCount ? 'danger' : 'default') as any"
                size="xs"
              >
                {{ activeMemberCount >= maxMembersCount ? 'Lleno' : 'Disponible' }}
              </Badge>
            </div>
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

      <!-- BLOQUE 2: PROGRESO DEL OBJETIVO (solo grupos NO TRAVEL con meta) -->
      <Card
        v-if="contributions?.goal != null && !isTravelGroup"
        class="group-detail__contributions-card"
      >
        <div class="group-detail__section-header">
          <Heading level="h3" size="lg" weight="semibold">Progreso del objetivo</Heading>
        </div>

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
          <ProgressBar
            :progress="progressPercent"
            variant="primary"
            size="md"
            class="group-detail__progress-bar"
          />
        </div>

        <div v-if="isLoadingContributions" class="group-detail__contributions-skeleton">
          <div v-for="i in 3" :key="i" class="group-detail__skeleton-member" />
        </div>

        <ul v-else class="group-detail__contributions-list">
          <li
            v-for="member in contributions.members"
            :key="member.userId ?? member.externalName ?? 'unknown'"
            class="group-detail__contribution-row"
          >
            <IconBadge
              :icon="
                member.memberStatus === 'external'
                  ? 'person_off'
                  : member.memberStatus === 'invited'
                    ? 'mail'
                    : 'person'
              "
              :variant="
                member.memberStatus === 'external'
                  ? 'neutral'
                  : member.memberStatus === 'invited'
                    ? 'secondary'
                    : 'primary'
              "
              size="sm"
            />
            <div class="group-detail__contribution-info">
              <div class="group-detail__contribution-name-row">
                <Text size="sm" weight="medium">
                  {{ member.handle ? `@${member.handle}` : (member.externalName ?? '—') }}
                </Text>
                <Text size="xs" color="muted">{{ roleLabels[member.role] }}</Text>
              </div>
              <div
                v-if="member.memberStatus === 'invited'"
                class="group-detail__contribution-status"
              >
                <Badge variant="secondary" size="xs">Invitación enviada</Badge>
              </div>
              <div
                v-else-if="member.memberStatus === 'external'"
                class="group-detail__contribution-status"
              >
                <Text size="xs" color="muted">Externo — gestión del organizador</Text>
              </div>
              <div v-else class="group-detail__contribution-amounts">
                <Text v-if="member.totalAmount > 0" size="sm" weight="medium">
                  {{ formatCurrency(member.totalAmount, 'COP') }} · {{ member.percentage }}%
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

      <!-- TRAVEL: Metrics bar -->
      <div v-if="isTravelGroup" class="group-detail__metrics-bar">
        <div class="group-detail__metric-card">
          <IconBadge icon="flag" variant="primary" size="sm" />
          <div class="group-detail__metric-body">
            <Text size="xs" color="muted">Meta</Text>
            <Text size="sm" weight="semibold">
              {{
                budgetProgress?.goal ? formatCurrency(budgetProgress.goal, 'COP') : 'Sin definir'
              }}
            </Text>
          </div>
        </div>
        <div class="group-detail__metric-card">
          <IconBadge icon="savings" variant="warning" size="sm" />
          <div class="group-detail__metric-body">
            <Text size="xs" color="muted">Aportado</Text>
            <Text size="sm" weight="semibold">
              {{ formatCurrency(budgetProgress?.totalLinked ?? 0, 'COP') }}
            </Text>
            <Text size="xs" color="muted">de la meta</Text>
          </div>
        </div>
        <div class="group-detail__metric-card">
          <IconBadge icon="receipt_long" variant="danger" size="sm" />
          <div class="group-detail__metric-body">
            <Text size="xs" color="muted">Gastos planificados</Text>
            <Text size="sm" weight="semibold">
              {{ formatCurrency(totalExpensesAmount, 'COP') }}
            </Text>
            <Text size="xs" color="muted">{{ expenses.length }} gastos</Text>
          </div>
        </div>
        <div class="group-detail__metric-card">
          <IconBadge icon="payments" variant="success" size="sm" />
          <div class="group-detail__metric-body">
            <Text size="xs" color="muted">Pagado</Text>
            <Text size="sm" weight="semibold">
              {{ formatCurrency(budgetProgress?.totalPaid ?? 0, 'COP') }}
            </Text>
          </div>
        </div>
      </div>

      <!-- TRAVEL: Two-column layout -->
      <div v-if="isTravelGroup" class="group-detail__travel-layout">
        <!-- LEFT: Gastos del plan -->
        <Card class="group-detail__expenses-card">
          <div class="group-detail__section-header">
            <Heading level="h3" size="lg" weight="semibold">Gastos del plan</Heading>
            <Button
              v-if="isOrganizer && !isClosed"
              variant="ghost"
              size="sm"
              icon="link"
              @click="openLinkExpenseModal()"
            >
              Vincular
            </Button>
          </div>

          <DataTable
            :columns="expenseTableColumns"
            :data="expenseTableData"
            :loading="isLoadingExpenses"
          >
            <template #cell-status="{ row }">
              <Badge :variant="getRowExpenseBadge(row as any).color as any" size="sm">
                {{ getRowExpenseBadge(row as any).label }}
              </Badge>
            </template>
            <template #actions="{ row }">
              <Button
                variant="ghost"
                size="xs"
                icon="info"
                @click="openExpenseDetail(String(row.id))"
              />
              <Button
                v-if="(row as any).canEdit"
                variant="ghost"
                size="xs"
                icon="edit"
                @click="openEditExpense(String(row.id))"
              />
              <Button
                v-if="(row as any).canAct"
                variant="primary"
                size="xs"
                icon="payments"
                @click="openPayModal(String(row.id))"
              >
                Pagar
              </Button>
              <Button
                v-if="(row as any).canAct && !hideCxpButton"
                variant="ghost"
                size="xs"
                icon="account_balance"
                @click="handleMarkCxp(String(row.id))"
              >
                CxP
              </Button>
            </template>
            <template #empty>
              <div class="group-detail__expenses-empty">
                <EmptyStateIllustration
                  type="no-transactions"
                  class="group-detail__empty-illustration"
                />
                <Heading level="h3" size="lg" weight="semibold">Sin gastos planificados</Heading>
                <Text size="sm" color="muted">
                  Agrega los gastos del grupo para hacer seguimiento.
                </Text>
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
            </template>
          </DataTable>
        </Card>

        <!-- RIGHT: Sidebar -->
        <div class="group-detail__travel-sidebar">
          <!-- Trip info card -->
          <Card class="group-detail__trip-info-card">
            <div class="group-detail__trip-info-header">
              <IconBadge icon="flight" variant="warning" size="sm" />
              <Heading level="h3" size="base" weight="semibold">Plan del viaje</Heading>
            </div>
            <dl class="group-detail__trip-info-body">
              <div v-if="selectedGroup.destination" class="group-detail__trip-info-row">
                <span class="material-symbols-outlined group-detail__trip-info-icon">
                  location_on
                </span>
                <dt class="group-detail__trip-info-label">Destino</dt>
                <dd class="group-detail__trip-info-value">{{ selectedGroup.destination }}</dd>
              </div>
              <div v-if="selectedGroup.estimatedDate" class="group-detail__trip-info-row">
                <span class="material-symbols-outlined group-detail__trip-info-icon">
                  calendar_month
                </span>
                <dt class="group-detail__trip-info-label">Fecha</dt>
                <dd class="group-detail__trip-info-value">
                  {{ formatDate(selectedGroup.estimatedDate) }}
                </dd>
              </div>
              <div class="group-detail__trip-info-row">
                <span class="material-symbols-outlined group-detail__trip-info-icon">flag</span>
                <dt class="group-detail__trip-info-label">Presupuesto</dt>
                <dd class="group-detail__trip-info-value">
                  {{
                    selectedGroup.goal ? formatCurrency(selectedGroup.goal, 'COP') : 'Sin definir'
                  }}
                </dd>
              </div>
              <div v-if="organizerDisplayName" class="group-detail__trip-info-row">
                <span class="material-symbols-outlined group-detail__trip-info-icon">
                  person_pin
                </span>
                <dt class="group-detail__trip-info-label">Organizador</dt>
                <dd class="group-detail__trip-info-value">{{ organizerDisplayName }}</dd>
              </div>
              <div class="group-detail__trip-info-row">
                <span class="material-symbols-outlined group-detail__trip-info-icon">group</span>
                <dt class="group-detail__trip-info-label">Capacidad</dt>
                <dd class="group-detail__trip-info-value">
                  {{ activeMemberCount }} / {{ maxMembersCount }}
                </dd>
              </div>
            </dl>
          </Card>

          <!-- Donut chart card -->
          <Card class="group-detail__donut-card">
            <div class="group-detail__donut-header">
              <Heading level="h3" size="base" weight="semibold">Meta del viaje</Heading>
              <div class="group-detail__donut-actions">
                <Button
                  v-if="isOrganizer && !isClosed"
                  variant="ghost"
                  size="sm"
                  icon="flag"
                  @click="showGoalModal = true"
                >
                  Meta
                </Button>
              </div>
            </div>
            <ClientOnly>
              <VueECharts
                :option="travelDonutOption"
                style="height: 160px; width: 100%"
                autoresize
              />
            </ClientOnly>
            <div class="group-detail__donut-legend">
              <div class="group-detail__donut-legend-item">
                <span class="group-detail__donut-dot group-detail__donut-dot--linked" />
                <Text size="xs">
                  Aportado: {{ formatCurrency(budgetProgress?.totalLinked ?? 0, 'COP') }}
                </Text>
              </div>
              <div v-if="budgetProgress?.goal" class="group-detail__donut-legend-item">
                <span class="group-detail__donut-dot group-detail__donut-dot--remaining" />
                <Text size="xs" color="muted">
                  Falta:
                  {{
                    formatCurrency(
                      Math.max(0, (budgetProgress.goal ?? 0) - (budgetProgress.totalLinked ?? 0)),
                      'COP'
                    )
                  }}
                </Text>
              </div>
            </div>
          </Card>

          <!-- Participants card -->
          <Card class="group-detail__participants-card">
            <div class="group-detail__participants-header">
              <Heading level="h3" size="base" weight="semibold">Participantes</Heading>
              <Button
                v-if="canManage && !isClosed"
                variant="ghost"
                size="sm"
                icon="person_add"
                @click="showInviteModal = true"
              >
                Invitar
              </Button>
            </div>

            <div v-if="isLoadingContributions" class="group-detail__budget-skeleton">
              <div v-for="i in 3" :key="i" class="group-detail__skeleton-member" />
            </div>

            <ul v-else-if="contributions?.members?.length" class="group-detail__participants-list">
              <li
                v-for="member in contributions.members"
                :key="member.userId ?? member.externalName ?? 'unknown'"
                class="group-detail__participant-row"
              >
                <IconBadge
                  :icon="member.memberStatus === 'invited' ? 'mail' : 'person'"
                  :variant="member.memberStatus === 'invited' ? 'secondary' : 'primary'"
                  size="sm"
                />
                <div class="group-detail__participant-info">
                  <div class="group-detail__participant-name-row">
                    <Text size="sm" weight="medium">
                      {{
                        member.userId
                          ? (memberDisplayName[member.userId] ?? member.externalName ?? '—')
                          : (member.externalName ?? '—')
                      }}
                    </Text>
                    <Badge v-if="member.memberStatus === 'invited'" variant="secondary" size="xs">
                      Pendiente
                    </Badge>
                  </div>
                  <Text size="xs" color="muted">{{ roleLabels[member.role] }}</Text>
                </div>
              </li>
            </ul>

            <div v-else class="group-detail__participants-empty">
              <Text size="sm" color="muted">Sin participantes aún</Text>
            </div>
          </Card>
        </div>
      </div>

      <!-- NON-TRAVEL layout -->
      <template v-if="!isTravelGroup">
        <!-- BLOQUE 4: GASTOS DEL PLAN -->
        <Card class="group-detail__expenses-card">
          <div class="group-detail__section-header">
            <Heading level="h3" size="lg" weight="semibold">Gastos del plan</Heading>
          </div>

          <!-- Expense metrics summary -->
          <div
            v-if="expenses.length > 0 && !isLoadingExpenses"
            class="group-detail__expense-metrics"
          >
            <div class="group-detail__expense-metrics-stats">
              <div class="group-detail__expense-metric">
                <Text size="xs" color="muted">Total</Text>
                <Text size="sm" weight="semibold">
                  {{ formatCurrency(totalExpensesAmount, 'COP') }}
                </Text>
              </div>
              <div class="group-detail__expense-metric group-detail__expense-metric--paid">
                <Text size="xs" color="muted">Pagado</Text>
                <Text size="sm" weight="semibold">
                  {{ formatCurrency(paidExpensesAmount, 'COP') }}
                </Text>
              </div>
              <div class="group-detail__expense-metric group-detail__expense-metric--pending">
                <Text size="xs" color="muted">Pendiente</Text>
                <Text size="sm" weight="semibold">
                  {{ formatCurrency(pendingExpensesAmount, 'COP') }}
                </Text>
              </div>
              <div class="group-detail__expense-metric">
                <Text size="xs" color="muted">Gastos</Text>
                <Text size="sm" weight="semibold">
                  {{ paidExpensesCount }} / {{ expenses.length }}
                </Text>
              </div>
            </div>
            <div class="group-detail__expense-metrics-footer">
              <Text size="xs" color="muted">{{ expensesPaidPercent }}% completado</Text>
              <ProgressBar :progress="expensesPaidPercent" variant="success" size="md" />
            </div>
          </div>

          <DataTable
            :columns="expenseTableColumns"
            :data="expenseTableData"
            :loading="isLoadingExpenses"
          >
            <template #cell-status="{ row }">
              <Badge :variant="getRowExpenseBadge(row as any).color as any" size="sm">
                {{ getRowExpenseBadge(row as any).label }}
              </Badge>
            </template>
            <template #actions="{ row }">
              <Button
                variant="ghost"
                size="xs"
                icon="info"
                @click="openExpenseDetail(String(row.id))"
              />
              <Button
                v-if="(row as any).canEdit"
                variant="ghost"
                size="xs"
                icon="edit"
                @click="openEditExpense(String(row.id))"
              />
              <Button
                v-if="(row as any).canAct"
                variant="primary"
                size="xs"
                icon="payments"
                @click="openPayModal(String(row.id))"
              >
                Pagar
              </Button>
              <Button
                v-if="(row as any).canAct && !hideCxpButton"
                variant="ghost"
                size="xs"
                icon="account_balance"
                @click="handleMarkCxp(String(row.id))"
              >
                CxP
              </Button>
            </template>
            <template #empty>
              <div class="group-detail__expenses-empty">
                <EmptyStateIllustration
                  type="no-transactions"
                  class="group-detail__empty-illustration"
                />
                <Heading level="h3" size="lg" weight="semibold">Sin gastos planificados</Heading>
                <Text size="sm" color="muted">
                  Agrega los gastos del grupo para hacer seguimiento.
                </Text>
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
            </template>
          </DataTable>
        </Card>
      </template>
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
          <Button variant="ghost" size="sm" @click="closePayModal">Cancelar</Button>
          <Button variant="primary" size="sm" @click="handlePay">Confirmar pago</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- MODAL: Invitar miembro -->
    <ModalWizard :show="showInviteModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Invitar Miembro"
          :sub-title="
            isTravelGroup
              ? 'Invita a un amigo al viaje con contexto del plan o de forma directa.'
              : 'Selecciona un amigo para agregar al grupo.'
          "
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

        <!-- Trip context banner (only for TRAVEL groups with planned amount) -->
        <div v-if="isTravelGroup && organizerLinkedAmount" class="group-detail__invite-trip-ctx">
          <span class="material-symbols-outlined group-detail__invite-trip-icon">flight</span>
          <div class="group-detail__invite-trip-info">
            <Text size="sm" weight="medium">{{ selectedGroup!.name }}</Text>
            <Text size="xs" color="muted">
              Meta:
              {{ selectedGroup!.goal ? formatCurrency(selectedGroup!.goal, 'COP') : 'Sin meta' }} ·
              Tu plan: {{ formatCurrency(organizerLinkedAmount, 'COP') }}
            </Text>
          </div>
        </div>

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
            <div class="group-detail__invite-actions">
              <Button
                v-if="isTravelGroup"
                type="button"
                variant="primary"
                size="sm"
                :disabled="invitingUserId === friend.friendUserId"
                @click="handleInvite(friend.friendUserId, true)"
              >
                {{ invitingUserId === friend.friendUserId ? '...' : 'Invitar al viaje' }}
              </Button>
              <Button
                v-if="isTravelGroup"
                type="button"
                variant="ghost"
                size="sm"
                :disabled="invitingUserId === friend.friendUserId"
                @click="handleInvite(friend.friendUserId, false)"
              >
                Agregar directo
              </Button>
              <Button
                v-if="!isTravelGroup"
                type="button"
                variant="primary"
                size="sm"
                :disabled="invitingUserId === friend.friendUserId"
                @click="handleInvite(friend.friendUserId)"
              >
                {{ invitingUserId === friend.friendUserId ? 'Invitando...' : 'Invitar' }}
              </Button>
            </div>
          </li>
        </ul>
        <div class="group-detail__modal-actions group-detail__modal-actions--end">
          <Button variant="ghost" size="sm" @click="showInviteModal = false">Cancelar</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- MODAL: Detalle del gasto -->
    <ModalWizard :show="showExpenseDetailModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Detalle del gasto"
          sub-title="Información completa del gasto planificado."
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
        <template v-if="selectedExpense">
          <div class="group-detail__detail-grid">
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Descripción</Text>
              <Text size="sm" weight="medium">{{ selectedExpense.description }}</Text>
            </div>
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Monto</Text>
              <Text size="sm" weight="semibold">
                {{ formatCurrency(selectedExpense.amount, 'COP') }}
              </Text>
            </div>
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Fecha estimada</Text>
              <Text size="sm">{{ formatDate(selectedExpense.dueDate) }}</Text>
            </div>
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Responsable</Text>
              <Text size="sm">{{ getResponsibleHandle(selectedExpense) }}</Text>
            </div>
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Estado</Text>
              <Badge :variant="getExpenseBadge(selectedExpense).color as any" size="sm">
                {{ getExpenseBadge(selectedExpense).label }}
              </Badge>
            </div>
            <div v-if="selectedExpense.cxcId" class="group-detail__detail-row">
              <Text size="xs" color="muted">Cuenta por cobrar</Text>
              <Badge variant="warning" size="sm">CxC creada</Badge>
            </div>
            <div v-if="selectedExpense.cxpId" class="group-detail__detail-row">
              <Text size="xs" color="muted">Cuenta por pagar (responsable)</Text>
              <Badge variant="warning" size="sm">CxP creada</Badge>
            </div>
            <div class="group-detail__detail-row">
              <Text size="xs" color="muted">Creado</Text>
              <Text size="xs" color="muted">{{ formatDate(selectedExpense.createdAt) }}</Text>
            </div>
          </div>
        </template>
        <div class="group-detail__modal-actions group-detail__modal-actions--end">
          <Button variant="ghost" size="sm" @click="showExpenseDetailModal = false">Cerrar</Button>
        </div>
      </div>
    </ModalWizard>

    <!-- MODAL: Editar gasto -->
    <ModalWizard :show="showEditExpenseModal">
      <div class="group-detail__modal">
        <CardInfo
          title="Editar gasto"
          sub-title="Modifica los datos del gasto planificado."
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
          v-if="expenseToEditId"
          :group-id="groupId"
          :members="activeMembers"
          :expense-id="expenseToEditId"
          :initial-data="expenseToEditInitialData"
          @on-success="handleExpenseUpdated"
          @on-close="
            showEditExpenseModal = false
            expenseToEditId = null
          "
        />
      </div>
    </ModalWizard>

    <!-- MODAL: Configurar meta -->
    <ModalWizard :show="showGoalModal">
      <div class="group-detail__modal">
        <GroupForm
          v-if="selectedGroup"
          mode="edit"
          :group-id="selectedGroup.id"
          :initial-data="{
            name: selectedGroup.name,
            type: selectedGroup.type,
            maxMembers: selectedGroup.maxMembers,
            goal: selectedGroup.goal
          }"
          @on-success="handleGoalSaved"
          @on-close="showGoalModal = false"
        />
      </div>
    </ModalWizard>

    <!-- MODAL: Vincular gasto del presupuesto -->
    <ModalWizard :show="showLinkExpenseModal">
      <div class="group-detail__modal">
        <!-- Sin presupuesto activo -->
        <template v-if="!currentBudget">
          <CardInfo
            title="Sin presupuesto activo"
            sub-title="Necesitas un presupuesto activo o en planificación para vincular gastos."
            title-size="xl"
            weight="extrabold"
            level="h1"
            color="black"
            sub-title-size="xs"
            sub-title-color="muted"
            icon="receipt_long"
            icon-size="md"
            icon-variant="warning"
          />
          <div class="group-detail__modal-actions group-detail__modal-actions--end">
            <Button variant="ghost" size="sm" @click="closeLinkExpenseModal()">Cerrar</Button>
          </div>
        </template>

        <!-- Formulario crear nuevo gasto (inline) -->
        <template v-else-if="showCreateExpenseInModal">
          <ExpensePlannedForm
            :budget-id="currentBudget.id"
            :group-id="groupId"
            @success="
              handleExpenseLinked()
              showCreateExpenseInModal = false
            "
            @close="showCreateExpenseInModal = false"
          />
        </template>

        <!-- Lista de gastos planificados para seleccionar -->
        <template v-else>
          <CardInfo
            title="Vincular gasto al grupo"
            sub-title="Selecciona un gasto planificado de tu presupuesto para vincularlo a este viaje."
            title-size="xl"
            weight="extrabold"
            level="h1"
            color="black"
            sub-title-size="xs"
            sub-title-color="muted"
            icon="receipt_long"
            icon-size="md"
            icon-variant="warning"
          />

          <!-- Skeleton -->
          <div v-if="isLoadingBudgetExpenses" class="group-detail__link-skeleton">
            <div v-for="i in 3" :key="i" class="group-detail__skeleton-member" />
          </div>

          <!-- Lista de gastos disponibles -->
          <template v-else>
            <ul v-if="budgetExpenses.length" class="group-detail__link-list">
              <li
                v-for="expense in budgetExpenses"
                :key="expense.id"
                class="group-detail__link-row"
              >
                <div class="group-detail__link-row-info">
                  <Text size="sm" weight="medium">{{ expense.name }}</Text>
                  <div class="group-detail__link-row-meta">
                    <Text size="xs" color="muted">{{ expense.category }}</Text>
                    <Text size="xs" color="muted">
                      {{
                        new Date(expense.dueDate).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short'
                        })
                      }}
                    </Text>
                  </div>
                </div>
                <Text size="sm" weight="semibold" class="group-detail__link-row-amount">
                  {{ formatCurrency(expense.expectedAmount, 'COP') }}
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  :disabled="linkingExpenseId === expense.id"
                  @click="handleLinkExisting(expense.id)"
                >
                  {{ linkingExpenseId === expense.id ? '...' : 'Vincular' }}
                </Button>
              </li>
            </ul>

            <!-- Sin gastos disponibles -->
            <div v-else class="group-detail__link-empty">
              <span class="material-symbols-outlined group-detail__link-empty-icon">
                receipt_long
              </span>
              <Text size="sm" color="muted">
                No tienes gastos planificados disponibles para vincular.
              </Text>
            </div>
          </template>

          <div class="group-detail__link-footer">
            <Button variant="ghost" size="sm" @click="closeLinkExpenseModal()">Cancelar</Button>
            <Button variant="ghost" size="sm" icon="add" @click="showCreateExpenseInModal = true">
              Crear gasto planificado
            </Button>
          </div>
        </template>
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

  .group-detail__member-chip {
    @apply flex items-center gap-1.5;
  }

  /* CARDS */
  .group-detail__contributions-card {
    @apply !p-5;
  }

  .group-detail__expenses-card {
    @apply !p-5;
  }

  .group-detail__section-header {
    @apply mb-4 flex items-center justify-between;
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

  /* EXPENSE METRICS */
  .group-detail__expense-metrics {
    @apply mb-4 flex flex-col gap-3 rounded-xl border border-neutral-100 p-4;
    @apply dark:border-neutral-700;
  }

  .group-detail__expense-metrics-stats {
    @apply grid grid-cols-2 gap-3 sm:grid-cols-4;
  }

  /* BUDGET PROGRESS CARD */
  .group-detail__budget-card {
    @apply !p-5;
  }

  .group-detail__budget-skeleton {
    @apply space-y-2;
  }

  .group-detail__budget-progress {
    @apply mb-4 space-y-2;
  }

  .group-detail__progress-labels-left {
    @apply flex flex-col gap-0.5;
  }

  .group-detail__budget-no-goal {
    @apply mb-4;
  }

  .group-detail__budget-set-goal-btn {
    @apply font-medium text-primary-600 underline hover:text-primary-700;
    @apply dark:text-primary-400 dark:hover:text-primary-300;
  }

  .group-detail__budget-expenses-list {
    @apply divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__budget-expense-row {
    @apply flex items-center gap-3 py-2;
  }

  .group-detail__budget-expense-icon {
    @apply shrink-0 text-base text-neutral-400;
  }

  .group-detail__budget-expense-name {
    @apply flex-1;
  }

  .group-detail__budget-empty {
    @apply flex flex-col items-center gap-3 py-6 text-center;
  }

  /* LINK EXPENSE MODAL */
  .group-detail__link-skeleton {
    @apply space-y-2;
  }

  .group-detail__link-list {
    @apply max-h-72 divide-y divide-neutral-100 overflow-y-auto rounded-xl border border-neutral-200;
    @apply dark:divide-neutral-700 dark:border-neutral-700;
  }

  .group-detail__link-row {
    @apply flex items-center gap-3 px-4 py-3;
  }

  .group-detail__link-row-info {
    @apply flex min-w-0 flex-1 flex-col gap-0.5;
  }

  .group-detail__link-row-meta {
    @apply flex gap-3;
  }

  .group-detail__link-row-amount {
    @apply shrink-0;
  }

  .group-detail__link-empty {
    @apply flex flex-col items-center gap-2 rounded-xl border border-neutral-100 py-8 text-center;
    @apply dark:border-neutral-700;
  }

  .group-detail__link-empty-icon {
    @apply text-4xl text-neutral-300 dark:text-neutral-600;
  }

  .group-detail__link-footer {
    @apply flex items-center justify-between border-t border-neutral-100 pt-3;
    @apply dark:border-neutral-700;
  }

  .group-detail__expense-metric {
    @apply flex flex-col gap-0.5;
  }

  .group-detail__expense-metric--paid :last-child {
    @apply text-success-600 dark:text-success-400;
  }

  .group-detail__expense-metric--pending :last-child {
    @apply text-warning-600 dark:text-warning-400;
  }

  .group-detail__expense-metrics-footer {
    @apply flex flex-col gap-1.5;
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

  .group-detail__expense-icon-btn {
    @apply flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400;
    @apply hover:bg-neutral-100 hover:text-neutral-600;
    @apply dark:hover:bg-neutral-700 dark:hover:text-neutral-300;
  }

  .group-detail__expense-icon-btn .material-symbols-outlined {
    font-size: 18px;
  }

  .group-detail__detail-grid {
    @apply flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200;
    @apply dark:divide-neutral-700 dark:border-neutral-700;
  }

  .group-detail__detail-row {
    @apply flex items-center justify-between gap-4 px-4 py-3;
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

  .group-detail__modal-actions--end {
    @apply justify-end;
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

  .group-detail__invite-actions {
    @apply flex shrink-0 items-center gap-1;
  }

  .group-detail__invite-trip-ctx {
    @apply flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 p-3;
    @apply dark:border-warning-900/40 dark:bg-warning-900/10;
  }

  .group-detail__invite-trip-icon {
    @apply shrink-0 text-xl text-warning-600 dark:text-warning-400;
  }

  .group-detail__invite-trip-info {
    @apply flex flex-col gap-0.5;
  }

  /* KEBAB */
  .group-detail__kebab-menu {
    @apply flex flex-col py-1;
  }

  .group-detail__kebab-item {
    @apply flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50;
    @apply dark:hover:bg-neutral-700;
  }

  /* TRAVEL METRICS BAR */
  .group-detail__metrics-bar {
    @apply grid grid-cols-2 gap-3 sm:grid-cols-4;
  }

  .group-detail__metric-card {
    @apply flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .group-detail__metric-body {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  /* TRAVEL TWO-COLUMN LAYOUT */
  .group-detail__travel-layout {
    @apply grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px];
  }

  .group-detail__travel-sidebar {
    @apply flex flex-col gap-4;
  }

  /* DONUT CHART */
  .group-detail__donut-card {
    @apply !p-4;
  }

  .group-detail__donut-header {
    @apply mb-2 flex items-center justify-between gap-2;
  }

  .group-detail__donut-actions {
    @apply flex items-center gap-1;
  }

  .group-detail__donut-legend {
    @apply mt-2 flex flex-col gap-1.5;
  }

  .group-detail__donut-legend-item {
    @apply flex items-center gap-2;
  }

  .group-detail__donut-dot {
    @apply h-2.5 w-2.5 shrink-0 rounded-full;
  }

  .group-detail__donut-dot--linked {
    @apply bg-warning-400;
  }

  .group-detail__donut-dot--remaining {
    @apply bg-neutral-200 dark:bg-neutral-600;
  }

  /* PARTICIPANTS */
  .group-detail__participants-card {
    @apply !p-4;
  }

  .group-detail__participants-header {
    @apply mb-3 flex items-center justify-between gap-2;
  }

  .group-detail__participants-list {
    @apply divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__participant-row {
    @apply flex items-start gap-3 py-3;
  }

  .group-detail__participant-info {
    @apply flex min-w-0 flex-1 flex-col gap-1;
  }

  .group-detail__participant-name-row {
    @apply flex flex-wrap items-center gap-2;
  }

  .group-detail__participants-empty {
    @apply py-4 text-center;
  }

  /* TRIP INFO CARD */
  .group-detail__trip-info-card {
    @apply !p-4;
  }

  .group-detail__trip-info-header {
    @apply mb-3 flex items-center gap-2;
  }

  .group-detail__trip-info-body {
    @apply flex flex-col divide-y divide-neutral-100 dark:divide-neutral-700;
  }

  .group-detail__trip-info-row {
    @apply flex items-center gap-2 py-2;
  }

  .group-detail__trip-info-icon {
    @apply shrink-0 text-base text-neutral-400 dark:text-neutral-500;
  }

  .group-detail__trip-info-label {
    @apply flex-1 text-xs text-neutral-500 dark:text-neutral-400;
  }

  .group-detail__trip-info-value {
    @apply text-sm font-medium text-neutral-800 dark:text-neutral-200;
  }
</style>
