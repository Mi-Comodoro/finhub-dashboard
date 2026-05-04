<script setup lang="ts">
  import { Button, Card, Heading, Text } from '@/components/atoms'
  import ContributionForm from '@/components/business/savings/forms/ContributionForm.vue'
  import GoalsForm from '@/components/business/savings/forms/GoalsForm.vue'
  import GoalMovements from '@/components/business/savings/GoalMovements.vue'
  import GoalProjectionChart from '@/components/business/savings/GoalProjectionChart.vue'
  import GoalSidebarPanel from '@/components/business/savings/GoalSidebarPanel.vue'
  import GoalDetailInsights from '@/components/business/savings/insight/GoalDetailInsights.vue'
  import { ModalWizard } from '@/components/organisms'
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useGoalDetailPresenter } from '@/composables/presenters/useGoalDetailPresenter'
  import type { GoalHistory, GoalsData, PlannedSaving } from '@/types/api'
  import { buildProjection, type SavingPoint } from '@/utils/compound-interest.utils'

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
    fetchGoalHistory
  } = useGoalsApplication()
  const { items: plannedSavingItems, fetchByBudget: fetchPlannedSavings } =
    usePlannedSavingApplication()
  const { savingsAmount } = useActiveBudgetApplication()

  // State
  const goal = ref<GoalsData | null>(null)
  const history = ref<GoalHistory[]>([])
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

  const handleContributionSuccess = async () => {
    closeContributionModal()
    await loadGoalDetail()
  }

  onMounted(async () => {
    await loadGoalDetail()

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

  // Planned savings for this goal - use from goal.plannedSavings if available (from backend)
  const goalSavings = computed<PlannedSaving[]>(() => {
    if (goal.value?.plannedSavings) {
      return goal.value.plannedSavings
    }
    // Fallback: normalize date to Date to match PlannedSaving type
    return (plannedSavingItems.value ?? [])
      .filter(s => s.savingGoalId === goal.value?.id)
      .map(s => ({
        ...s,
        date: s.date instanceof Date ? s.date : new Date(s.date)
      })) as PlannedSaving[]
  })

  const completedSavings = computed(() => goalSavings.value.filter(s => s.status === 'completed'))

  const totalSavedForGoal = computed(() =>
    completedSavings.value.reduce((acc, s) => acc + (s.amount ?? 0), 0)
  )

  const firstSavingDate = computed(() => {
    const completed = completedSavings.value
    if (!completed.length) return null
    return (
      completed.reduce((earliest, s) => {
        const sDate = new Date(s.completedAt ?? s.date)
        const eDate = new Date(earliest.completedAt ?? earliest.date)
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

  const estimatedInterest = computed(() => {
    const annualRate = account.value?.interestRate ?? 0
    if (!annualRate || !completedSavings.value.length) return 0

    const today = new Date()
    return completedSavings.value.reduce((acc, saving) => {
      if (!saving.completedAt) return acc
      const completedDate = new Date(saving.completedAt)
      const daysSince = Math.max(
        0,
        Math.floor((today.getTime() - completedDate.getTime()) / 86_400_000)
      )
      const interest = saving.amount * (Math.pow(1 + annualRate / 100, daysSince / 365) - 1)
      return acc + interest
    }, 0)
  })

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

    <div v-else-if="goal" class="goal-detail__layout">
      <div class="goal-detail__main">
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
      </div>

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

    <!-- Modals -->
    <ModalWizard v-model:show="showEditModal">
      <GoalsForm
        mode="edit"
        :initial-data="
          goal
            ? {
                id: goal.id,
                name: goal.name,
                reason: goal.reason,
                accountId: goal.accountId,
                targetAmount: goal.targetAmount,
                targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
                isActive: goal.isActive
              }
            : null
        "
        @on-success="handleEditSuccess"
        @on-close="closeEditModal"
      />
    </ModalWizard>

    <ModalWizard v-model:show="showContributionModal">
      <ContributionForm
        :goal-id="goalId"
        :accounts="accountsFromGoals"
        @on-close="handleContributionSuccess"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .goal-detail {
    @apply space-y-4;
  }

  /* Header */
  .goal-detail__header {
    @apply flex w-full items-center justify-between gap-4 p-4;
  }

  .goal-detail__header-name {
    @apply leading-tight;
  }

  .goal-detail__header-actions {
    @apply flex items-center gap-2;
  }

  .goal-detail__loading {
    @apply flex items-center justify-center py-20;
  }

  /* Layout */
  .goal-detail__layout {
    @apply flex flex-col gap-6 px-4 lg:flex-row lg:items-start;
  }

  .goal-detail__main {
    @apply flex flex-1 flex-col gap-6;
  }

  .goal-detail__sidebar {
    @apply flex flex-col gap-4;
    @apply lg:w-80 lg:shrink-0;
    @apply lg:sticky lg:top-6;
  }

  /* Projection Card */
  .goal-detail__projection-card {
    @apply space-y-4;
  }

  .goal-detail__projection-header {
    @apply flex items-center justify-between;
  }

  .goal-detail__horizon-toggle {
    @apply flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .goal-detail__horizon-btn {
    @apply rounded-md px-3 py-1 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700;
  }

  .goal-detail__horizon-btn--active {
    @apply bg-primary-500 text-white hover:bg-primary-600;
  }
</style>
