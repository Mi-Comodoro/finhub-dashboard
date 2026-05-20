<script setup lang="ts">
  import { Button, Card, Heading, Text } from '@/components/atoms'
  import ContributionForm from '@/components/business/savings/forms/ContributionForm.vue'
  import GoalsForm from '@/components/business/savings/forms/GoalsForm.vue'
  import GoalMovements from '@/components/business/savings/GoalMovements.vue'
  import GoalSidebarPanel from '@/components/business/savings/GoalSidebarPanel.vue'
  import GoalDetailInsights from '@/components/business/savings/insight/GoalDetailInsights.vue'
  import { ModalWizard } from '@/components/organisms'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useGoalDetailPresenter } from '@/composables/presenters/useGoalDetailPresenter'
  import type { GoalHistory, GoalsData, PlannedSaving, Transaction } from '@/types/api'
  import { buildProjection, type SavingPoint } from '@/utils/compound-interest.utils'
  import { formatCurrency } from '@/utils/currency'

  const GoalProjectionChart = defineAsyncComponent(
    () => import('@/components/business/savings/GoalProjectionChart.vue')
  )

  definePageMeta({
    layout: 'dashboard',
    title: 'Detalle de Meta',
    breadcrumb: 'Detalle',
    parents: ['Metas']
  })

  const route = useRoute()
  const goalId = computed(() => route.params.id as string)

  const {
    currentBudgetPlan,
    accounts: accountsFromGoals,
    savingAllocations,
    fetchAccounts,
    fetchSavingAllocations,
    fetchGoalDetail,
    fetchGoalHistory,
    fetchGoalContributions,
    addGoalInterest
  } = useGoalsApplication()
  const { show: showToast } = useToast()
  const { items: plannedSavingItems, fetchByBudget: fetchPlannedSavings } =
    usePlannedSavingApplication()
  const { savingsAmount } = useActiveBudgetApplication()

  // State
  const goal = ref<GoalsData | null>(null)
  const history = ref<GoalHistory[]>([])
  const contributions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const selectedHorizon = ref<'1m' | '3m' | '12m' | '24m' | '36m'>('3m')

  // Modal state
  const showEditModal = ref(false)
  const showContributionModal = ref(false)

  // Fetch data
  const loadGoalDetail = async () => {
    if (!goalId.value) return
    isLoading.value = true
    try {
      const [goalResponse, historyResponse] = await Promise.all([
        fetchGoalDetail(goalId.value),
        fetchGoalHistory(goalId.value)
      ])

      if (goalResponse.success) {
        goal.value = goalResponse.result
      }
      if (historyResponse.success) {
        history.value = historyResponse.result
      }

      // Load accounts and allocations if needed
      if (accountsFromGoals.value.length === 0) {
        await fetchAccounts()
      }
      const currentBudgetId = currentBudgetPlan.value?.id
      if (currentBudgetId && savingAllocations.value.length === 0) {
        await fetchSavingAllocations(currentBudgetId)
      }
    } catch (error) {
      console.error('Error loading goal detail:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Modal handlers
  const openEditModal = () => {
    showEditModal.value = true
  }

  const closeEditModal = () => {
    showEditModal.value = false
  }

  const openContributionModal = () => {
    showContributionModal.value = true
  }

  const closeContributionModal = () => {
    showContributionModal.value = false
  }

  const handleEditSuccess = async () => {
    closeEditModal()
    await loadGoalDetail()
  }

  const loadContributions = async () => {
    if (!goalId.value) return
    const response = await fetchGoalContributions(goalId.value)
    if (response.success) {
      contributions.value = response.result
    }
  }

  const handleContributionSuccess = async () => {
    closeContributionModal()
    await Promise.all([loadGoalDetail(), loadContributions()])
  }

  onMounted(async () => {
    await Promise.all([loadGoalDetail(), loadContributions()])

    // Load planned savings for the current budget if not loaded
    const currentBudgetId = currentBudgetPlan.value?.id
    if (!plannedSavingItems.value && currentBudgetId) {
      await fetchPlannedSavings(currentBudgetId)
    }
  })

  // Computed
  const account = computed(() => {
    if (!goal.value) return null
    return accountsFromGoals.value.find(a => a.id === goal.value!.accountId)
  })

  const progressPercentage = computed(() => {
    if (!goal.value?.targetAmount || goal.value.targetAmount === 0) return 0
    return Math.min(100, Math.round((totalSavedForGoal.value / goal.value.targetAmount) * 100))
  })

  // Planned savings for this goal - used for projection chart and movements list
  const goalSavings = computed<PlannedSaving[]>(() => goal.value?.plannedSavings ?? [])

  const completedSavings = computed(() => goalSavings.value.filter(s => s.status === 'completed'))

  // Split contributions by type
  const savingsContributions = computed(() => contributions.value.filter(t => t.type === 'savings'))
  const interestContributions = computed(() => contributions.value.filter(t => t.type === 'interest'))

  // Principal saved (deposits only) — fallback to PlannedSavings for historical data
  const principalSaved = computed(() => {
    const savingsTxTotal = savingsContributions.value.reduce((acc, t) => acc + (t.amount ?? 0), 0)
    const psTotal = completedSavings.value.reduce((acc, s) => acc + (s.amount ?? 0), 0)
    return Math.max(savingsTxTotal, psTotal)
  })

  // Registered interest from explicit interest transactions
  const totalRegisteredInterest = computed(() =>
    interestContributions.value.reduce((acc, t) => acc + (t.amount ?? 0), 0)
  )

  // Total balance: deposits + registered interest (both count toward goal progress)
  const totalSavedForGoal = computed(() => principalSaved.value + totalRegisteredInterest.value)

  const firstSavingDate = computed(() => {
    const completed = completedSavings.value
    if (!completed.length) return null
    return (
      completed.reduce((earliest, s) => {
        const sDate = new Date(s.completedAt)
        const eDate = new Date(earliest.completedAt)
        return sDate < eDate ? s : earliest
      }).completedAt ?? completed[0]!.date
    )
  })

  // Mes de inicio real (1-indexed, relativo al año actual)
  const startMonth = computed(() => {
    if (!firstSavingDate.value) return 1
    return new Date(firstSavingDate.value).getMonth() + 1
  })

  const monthlyContribution = computed(() => {
    const allocation = savingAllocations.value.find(a => a.goalId === goal.value?.id)
    if (allocation && savingsAmount.value > 0)
      return (savingsAmount.value * allocation.percentage) / 100
    if (completedSavings.value.length > 0)
      return totalSavedForGoal.value / completedSavings.value.length
    return 0
  })

  const granularity = computed<'daily' | 'weekly' | 'monthly'>(() => {
    if (selectedHorizon.value === '1m') return 'daily'
    if (selectedHorizon.value === '3m') return 'weekly'
    return 'monthly'
  })

  const projectionPoints = computed<SavingPoint[]>(() => {
    const interestRate = account.value?.interestRate ?? 0

    if (goalSavings.value.length === 0) return []

    // Use new buildProjection with actual and projected savings
    return buildProjection({
      savings: goalSavings.value.map(s => ({
        amount: s.amount ?? 0,
        status: s.status,
        completedAt: s.completedAt,
        date: s.date
      })),
      annualRate: interestRate,
      view: selectedHorizon.value,
      referenceDate: new Date()
    })
  })

  const basePoints = computed(() => projectionPoints.value.map(p => p.withoutInterest))

  // Derive total earned interest directly from the projection (same formula + same simulated
  // contributions as the chart), reading today's daily point so banner == chart hover.
  const totalEarnedInterest = computed(() => {
    const annualRate = account.value?.interestRate ?? 0
    if (!annualRate || !goalSavings.value.length) return 0

    const dailyPoints = buildProjection({
      savings: goalSavings.value.map(s => ({
        amount: s.amount ?? 0,
        status: s.status,
        completedAt: s.completedAt,
        date: s.date
      })),
      annualRate,
      view: '1m',
      referenceDate: new Date()
    })

    const todayIndex = new Date().getDate() - 1
    const point = dailyPoints[Math.min(todayIndex, dailyPoints.length - 1)]
    return point ? Math.max(0, point.withInterest - point.withoutInterest) : 0
  })

  // If interest transactions exist, show the registered total; otherwise show calculated estimate
  const estimatedInterest = computed(() =>
    totalRegisteredInterest.value > 0 ? totalRegisteredInterest.value : totalEarnedInterest.value
  )

  // Interest that hasn't been registered yet
  const unregisteredInterest = computed(() =>
    Math.max(0, totalEarnedInterest.value - totalRegisteredInterest.value)
  )

  // Determine if there are past periods without registered interest
  const lastInterestDate = computed(() => {
    if (!interestContributions.value.length) return null
    return interestContributions.value.reduce((latest, t) => {
      const d = new Date(t.transactionDate)
      return d > latest ? d : latest
    }, new Date(0))
  })

  const hasMissingPastPeriods = computed(() => {
    if (totalRegisteredInterest.value === 0) return true
    const last = lastInterestDate.value
    if (!last) return true
    const freq = account.value?.compoundingFrequency
    const today = new Date()
    if (freq === 'daily') {
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const lastDay = new Date(last)
      lastDay.setHours(0, 0, 0, 0)
      return lastDay < yesterday
    }
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    return last < startOfMonth
  })

  const interestBannerMessage = computed(() => {
    if (totalRegisteredInterest.value === 0) {
      const firstSaving = goalSavings.value
        .filter(s => s.status !== 'skipped')
        .sort((a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime())[0]
      const firstDate = firstSaving ? new Date(String(firstSaving.date)) : null
      if (firstDate && !isNaN(firstDate.getTime())) {
        const label = firstDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
        return `Tienes intereses acumulados sin registrar desde ${label}`
      }
      return 'Tienes intereses acumulados sin registrar'
    }
    if (hasMissingPastPeriods.value) {
      return 'Tienes intereses de períodos anteriores sin registrar'
    }
    const freq = account.value?.compoundingFrequency
    return freq === 'daily' ? 'Intereses del día no registrados' : 'Intereses del mes no registrados'
  })

  const shouldShowInterestBanner = computed(
    () =>
      unregisteredInterest.value > 0.01 &&
      (account.value?.interestRate ?? 0) > 0 &&
      principalSaved.value > 0 &&
      !isLoading.value
  )

  const isRegisteringInterest = ref(false)

  const handleRegisterInterest = async () => {
    if (!goalId.value || unregisteredInterest.value <= 0 || isRegisteringInterest.value) return
    isRegisteringInterest.value = true
    const { success } = await addGoalInterest(goalId.value, unregisteredInterest.value)
    isRegisteringInterest.value = false
    if (success) {
      showToast({ title: 'Interés registrado', type: 'success' })
      await loadContributions()
    } else {
      showToast({ title: 'Error al registrar el interés', type: 'error' })
    }
  }

  const withInterest = computed(() => projectionPoints.value.map(p => p.withInterest))

  const projectionLabels = computed(() => projectionPoints.value.map(p => p.label))

  const projectionSummary = computed(() => {
    // Use last projection points
    const lastWithInterest = withInterest.value[withInterest.value.length - 1] ?? 0
    const lastBase = basePoints.value[basePoints.value.length - 1] ?? 0
    const diff = lastWithInterest - lastBase

    // Calculate months to goal (estimate based on current projection rate)
    let monthsToGoal: number | null = null
    if (goal.value?.targetAmount && diff > 0 && lastBase > 0) {
      // Extrapolate based on current growth rate
      const remaining = goal.value.targetAmount - totalSavedForGoal.value - estimatedInterest.value
      if (remaining > 0 && monthlyContribution.value > 0) {
        // Simple estimation: remaining / monthly contribution
        monthsToGoal = Math.ceil(remaining / monthlyContribution.value)
      }
    }

    return {
      lastWithInterest,
      lastBase,
      diff,
      monthsToGoal
    }
  })

  // Use presenter for insights (after all dependencies are defined)
  const {
    totalDeposited,
    estimatedInterest: presentedInterest,
    pendingAmount,
    estimatedTimeToGoal,
    interestRateLabel
  } = useGoalDetailPresenter({
    goal,
    principalSaved,
    totalSavedForGoal,
    estimatedInterest,
    projectionMonthsToGoal: computed(() => projectionSummary.value.monthsToGoal),
    accountInterestRate: computed(() => account.value?.interestRate ?? 0)
  })

  const currency = 'COP' as const

  // Set initial horizon based on compounding frequency
  watch(
    account,
    acc => {
      if (acc && selectedHorizon.value === '3m') {
        // Solo cambiar si aún está en el valor por defecto
        selectedHorizon.value = acc.compoundingFrequency === 'daily' ? '1m' : '3m'
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div class="goal-detail">
    <!-- Header -->
    <div v-if="goal" class="goal-detail__header">
      <Heading level="h1" size="2xl" weight="extrabold" class="goal-detail__header-name">
        {{ goal.name }}
      </Heading>

      <!-- Action buttons -->
      <div class="goal-detail__header-actions">
        <Button variant="ghost" size="sm" icon="edit" @click="openEditModal">Editar</Button>
        <Button variant="primary" size="sm" icon="add" @click="openContributionModal">
          Aporte
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="goal-detail__loading">
      <Text>Cargando...</Text>
    </div>

    <div v-else-if="goal" class="goal-detail__content">
      <!-- Interest registration banner -->
      <div v-if="shouldShowInterestBanner" class="goal-detail__interest-banner">
        <div class="goal-detail__interest-banner-info">
          <span class="material-symbols-outlined goal-detail__interest-banner-icon">
            notifications_active
          </span>
          <div>
            <Text size="sm" weight="medium">{{ interestBannerMessage }}</Text>
            <Text size="xs" color="muted">
              Intereses pendientes: {{ formatCurrency(unregisteredInterest, currency) }}
            </Text>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          :loading="isRegisteringInterest"
          @click="handleRegisterInterest"
        >
          Registrar
        </Button>
      </div>

    <div class="goal-detail__layout">
      <ResponsiveContainer class="goal-detail__main">
        <!-- Insights -->
        <GoalDetailInsights
          :total-deposited="totalDeposited"
          :estimated-interest="presentedInterest"
          :pending-amount="pendingAmount"
          :interest-rate-label="interestRateLabel"
          :currency-code="currency"
        />

        <!-- Proyección de crecimiento -->
        <Card class="goal-detail__projection-card">
          <div class="goal-detail__projection-header">
            <Heading level="h2" size="lg" weight="bold">Proyección de Crecimiento</Heading>
            <div class="goal-detail__horizon-toggle">
              <button
                v-for="horizon in ['1m', '3m', '12m', '24m', '36m']"
                :key="horizon"
                :class="[
                  'goal-detail__horizon-btn',
                  { 'goal-detail__horizon-btn--active': selectedHorizon === horizon }
                ]"
                @click="selectedHorizon = horizon as '1m' | '3m' | '12m' | '24m' | '36m'"
              >
                {{ horizon }}
              </button>
            </div>
          </div>

          <GoalProjectionChart
            :base-data="basePoints"
            :interest-data="withInterest"
            :granularity="granularity"
            :periods="projectionPoints.length"
            :start-month="startMonth"
            :target-amount="goal?.targetAmount ?? undefined"
            :currency="currency"
            :current-balance="totalSavedForGoal"
            :interest-rate="account?.interestRate"
            :labels="projectionLabels"
          />
        </Card>

        <GoalMovements :goal-id="goalId" :movements="goalSavings" />
      </ResponsiveContainer>

      <!-- Sidebar -->
      <aside class="goal-detail__sidebar">
        <GoalSidebarPanel
          :goal="goal"
          :history="history"
          :account="account"
          :progress-percentage="progressPercentage"
          :saved-amount="totalSavedForGoal"
          :currency="currency"
          :estimated-time-to-goal="estimatedTimeToGoal"
        />
      </aside>
    </div>
    </div>

    <!-- Modals -->
    <ModalWizard v-model:show="showEditModal">
      <GoalsForm
        mode="edit"
        :initial-data="goal"
        @on-success="handleEditSuccess"
        @on-close="closeEditModal"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showContributionModal">
      <ContributionForm
        :goal-id="goalId"
        @on-close="handleContributionSuccess"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .goal-detail {
    @apply space-y-4 px-4 py-2;
  }

  /* Header */
  .goal-detail__header {
    @apply flex w-full items-center justify-between gap-4 p-4;
  }

  .goal-detail__header-name {
    @apply leading-tight text-neutral-900 dark:text-white;
  }

  .goal-detail__header-actions {
    @apply flex items-center gap-2;
  }

  .goal-detail__loading {
    @apply flex items-center justify-center py-20;
  }

  .goal-detail__content {
    @apply flex flex-col gap-4;
  }

  /* Interest banner */
  .goal-detail__interest-banner {
    @apply flex items-center justify-between gap-4 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3;
  }

  .goal-detail__interest-banner-info {
    @apply flex items-center gap-3;
  }

  .goal-detail__interest-banner-icon {
    @apply text-warning-600;
  }

  /* Layout Principal */
  .goal-detail__layout {
    @apply flex flex-col gap-6 px-4 lg:flex-row lg:items-start;
  }

  .goal-detail__main {
    @apply flex flex-1 flex-col gap-6;
  }

  .goal-detail__sidebar {
    @apply flex w-full flex-col gap-4;
    @apply lg:sticky lg:top-6 lg:w-[320px] lg:shrink-0;
  }

  /* Tarjeta de Proyección */
  .goal-detail__projection-card {
    @apply flex flex-col gap-4 p-6;
  }

  .goal-detail__projection-header {
    @apply flex flex-wrap items-center justify-between gap-4;
  }

  /* Selector de Tiempo */
  .goal-detail__horizon-toggle {
    @apply flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .goal-detail__horizon-btn {
    @apply rounded-md px-3 py-1 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700;
  }

  .goal-detail__horizon-btn--active {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
</style>
