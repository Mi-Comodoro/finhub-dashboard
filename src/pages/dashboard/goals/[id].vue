<script setup lang="ts">
  import Button from '@/components/atoms/button/Button.vue'
  import Card from '@/components/atoms/card/Card.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import ContributionForm from '@/components/business/savings/forms/ContributionForm.vue'
  import GoalsForm from '@/components/business/savings/forms/GoalsForm.vue'
  import GoalInfoCarousel from '@/components/business/savings/GoalInfoCarousel.vue'
  import type { GoalMovementItem } from '@/components/business/savings/GoalMovements.vue'
  import GoalMovements from '@/components/business/savings/GoalMovements.vue'
  import GoalSidebarPanel from '@/components/business/savings/GoalSidebarPanel.vue'
  import GoalDetailInsights from '@/components/business/savings/insight/GoalDetailInsights.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import { useToast } from '@/components/organisms/toast/useToast'
  import { useActiveBudgetApplication } from '@/composables/application/useActiveBudgetApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
  import { useGoalDetailPresenter } from '@/composables/presenters/useGoalDetailPresenter'
  import type { GoalHistory, GoalsData, PlannedSaving, Transaction } from '@/types/api'
  import { buildProjection, type SavingPoint } from '@/utils/compound-interest.utils'
  import { formatCurrency } from '@/utils/currency'
  import DateUtils from '@/utils/date'

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
    fetchGoalSummary,
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
  const goalSummary = ref<{ totalSavings: number; totalInterest: number }>({
    totalSavings: 0,
    totalInterest: 0
  })
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

  const loadSummary = async () => {
    if (!goalId.value) return
    const response = await fetchGoalSummary(goalId.value)
    if (response.success && response.result) {
      goalSummary.value = response.result
    }
  }

  const handleContributionSuccess = async () => {
    closeContributionModal()
    await Promise.all([loadGoalDetail(), loadContributions(), loadSummary()])
  }

  onMounted(async () => {
    await Promise.all([loadGoalDetail(), loadContributions(), loadSummary()])

    // Load planned savings for the current budget if not loaded
    const currentBudgetId = currentBudgetPlan.value?.id
    if (!plannedSavingItems.value && currentBudgetId) {
      await fetchPlannedSavings(currentBudgetId)
    }

    await tryAutoRegisterInterest()
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

  const interestContributions = computed(() =>
    contributions.value.filter(t => t.type === 'interest')
  )

  // Use completed PlannedSavings as primary source: they always carry savingGoalId,
  // whereas transactions from completePlannedSaving historically lacked that field.
  // Fall back to the backend summary only when no PlannedSavings exist yet.
  const principalSaved = computed(() => {
    const psTotal = completedSavings.value.reduce((acc, s) => acc + (s.amount ?? 0), 0)
    return psTotal || goalSummary.value.totalSavings
  })

  // Sum interest from contributions (those with savingGoalId) as primary;
  // fall back to backend summary for interest registered via the old flow.
  const totalRegisteredInterest = computed(
    () =>
      interestContributions.value.reduce((sum, t) => sum + t.amount, 0) ||
      goalSummary.value.totalInterest
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
    if (completedSavings.value.length > 0) {
      const psTotal = completedSavings.value.reduce((acc, s) => acc + (s.amount ?? 0), 0)
      return psTotal / completedSavings.value.length
    }
    return 0
  })

  const granularity = computed<'daily' | 'weekly' | 'monthly'>(() => {
    if (selectedHorizon.value === '1m') return 'daily'
    if (selectedHorizon.value === '3m') return 'weekly'
    return 'monthly'
  })

  // Use completed PlannedSavings for the projection: they always have savingGoalId and
  // cover deposits from both completePlannedSaving and createContribution flows.
  // Filtering by 'completed' prevents double-counting when a pending entry coexists.
  // Use completedAt as primary date so interest is calculated from the actual deposit
  // date, not the scheduled planned date (which may be earlier and inflate interest).
  const savingsForProjection = computed(() =>
    completedSavings.value.map(s => ({
      amount: s.amount ?? 0,
      status: 'completed' as const,
      completedAt: String(s.completedAt ?? s.date),
      date: String(s.completedAt ?? s.date)
    }))
  )

  // Unified movements list: completed deposits (PlannedSavings) + registered interest transactions.
  // Savings transactions are excluded to avoid duplication with PlannedSavings entries.
  const allMovements = computed<GoalMovementItem[]>(() => {
    const deposits = completedSavings.value.map(s => ({
      id: s.id,
      date: String(s.completedAt ?? s.date),
      amount: s.amount ?? 0,
      kind: (s.type ?? 'aporte') as GoalMovementItem['kind'],
      note: s.note
    }))

    const interestTxs = contributions.value
      .filter(t => t.type === 'interest')
      .map(t => ({
        id: t.id,
        date: String(t.transactionDate),
        amount: t.amount,
        kind: 'interes' as const,
        note: t.source
      }))

    return [...deposits, ...interestTxs]
  })

  const projectionPoints = computed<SavingPoint[]>(() => {
    const interestRate = account.value?.interestRate ?? 0
    if (savingsForProjection.value.length === 0) return []
    const points = buildProjection({
      savings: savingsForProjection.value,
      annualRate: interestRate,
      view: selectedHorizon.value,
      referenceDate: new Date()
    })

    // The projection algorithm may underestimate interest vs what was actually
    // registered (different calculation methods). Apply the gap as a uniform
    // offset so the chart's today-point matches the registered amount and
    // future projections compound from the correct baseline.
    const registered = totalRegisteredInterest.value
    const projected = totalEarnedInterest.value
    const adjustment = registered > projected ? registered - projected : 0
    if (adjustment <= 0) return points

    return points.map(p => ({ ...p, withInterest: p.withInterest + adjustment }))
  })

  const basePoints = computed(() => projectionPoints.value.map(p => p.withoutInterest))

  // Derive total earned interest directly from the projection (same formula as the chart),
  // reading today's daily point so banner == chart hover.
  const totalEarnedInterest = computed(() => {
    const annualRate = account.value?.interestRate ?? 0
    if (!annualRate || !savingsForProjection.value.length) return 0

    const dailyPoints = buildProjection({
      savings: savingsForProjection.value,
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
        const label = firstDate.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
        return `Tienes intereses acumulados sin registrar desde ${label}`
      }
      return 'Tienes intereses acumulados sin registrar'
    }
    if (hasMissingPastPeriods.value) {
      return 'Tienes intereses de períodos anteriores sin registrar'
    }
    const freq = account.value?.compoundingFrequency
    return freq === 'daily'
      ? 'Intereses del día no registrados'
      : 'Intereses del mes no registrados'
  })

  // Suppress banner if the goal's lastInterestDate is today: interest was already
  // registered (possibly by completePlannedSaving, which doesn't set savingGoalId
  // and therefore won't appear in interestContributions or goalSummary.totalInterest).
  const interestRegisteredToday = computed(() => {
    const lid = goal.value?.lastInterestDate
    if (!lid) return false
    const d = new Date(lid)
    const today = new Date()
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  })

  const isRegisteringInterest = ref(false)
  const autoRegistrationFailed = ref(false)

  const shouldShowInterestBanner = computed(() => autoRegistrationFailed.value)

  const tryAutoRegisterInterest = async () => {
    if (
      !goalId.value ||
      unregisteredInterest.value <= 0.01 ||
      (account.value?.interestRate ?? 0) === 0 ||
      principalSaved.value === 0 ||
      interestRegisteredToday.value ||
      isRegisteringInterest.value
    )
      return
    isRegisteringInterest.value = true
    const { success } = await addGoalInterest(goalId.value, unregisteredInterest.value)
    isRegisteringInterest.value = false
    if (success) {
      await Promise.all([loadContributions(), loadSummary()])
    } else {
      autoRegistrationFailed.value = true
    }
  }

  const handleRegisterInterest = async () => {
    if (!goalId.value || unregisteredInterest.value <= 0 || isRegisteringInterest.value) return
    isRegisteringInterest.value = true
    const { success } = await addGoalInterest(goalId.value, unregisteredInterest.value)
    isRegisteringInterest.value = false
    if (success) {
      showToast({ title: 'Interés registrado', type: 'success' })
      autoRegistrationFailed.value = false
      await Promise.all([loadContributions(), loadSummary()])
    } else {
      showToast({ title: 'Error al registrar el interés', type: 'error' })
    }
  }

  const withInterest = computed(() => projectionPoints.value.map(p => p.withInterest))

  const projectionLabels = computed(() => projectionPoints.value.map(p => p.label))

  const projectionSummary = computed(() => {
    const lastWithInterest = withInterest.value[withInterest.value.length - 1] ?? 0
    const lastBase = basePoints.value[basePoints.value.length - 1] ?? 0
    const diff = lastWithInterest - lastBase

    let monthsToGoal: number | null = null
    const target = goal.value?.targetAmount
    const C = monthlyContribution.value
    const B = totalSavedForGoal.value

    if (target && C > 0 && B >= 0) {
      const remaining = target - B
      if (remaining <= 0) {
        monthsToGoal = 0
      } else {
        const annualRate = account.value?.interestRate ?? 0
        if (annualRate > 0) {
          // Time-to-goal with compound interest:
          // B*(1+r)^N + C*((1+r)^N - 1)/r = T
          // → N = ln((T + C/r) / (B + C/r)) / ln(1 + r)
          const r = Math.pow(1 + annualRate / 100, 1 / 12) - 1
          const factor = C / r
          const ratio = (target + factor) / (B + factor)
          if (ratio > 1) {
            monthsToGoal = Math.ceil(Math.log(ratio) / Math.log(1 + r))
          }
        } else {
          monthsToGoal = Math.ceil(remaining / C)
        }
      }
    }

    return { lastWithInterest, lastBase, diff, monthsToGoal }
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

  const isDeadlineAtRisk = computed(() => {
    const months = projectionSummary.value.monthsToGoal
    if (!goal.value?.targetDate || months === null || months <= 0) return false
    const estimated = new Date()
    estimated.setMonth(estimated.getMonth() + months)
    const target = new Date(String(goal.value.targetDate))
    return estimated > target
  })

  const estimatedCompletionLabel = computed(() => {
    const months = projectionSummary.value.monthsToGoal
    if (months === null) return ''
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    return DateUtils.formatDate(date, 'short')
  })

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
    <!-- Skeleton while loading -->
    <template v-if="isLoading">
      <!-- Header skeleton -->
      <div class="goal-detail__skeleton-header">
        <div class="goal-detail__skeleton-title" />
        <div class="goal-detail__skeleton-actions">
          <div class="goal-detail__skeleton-btn" />
          <div class="goal-detail__skeleton-btn" />
        </div>
      </div>

      <!-- Body skeleton -->
      <div class="goal-detail__layout">
        <div class="goal-detail__main">
          <!-- Insight cards -->
          <div class="goal-detail__skeleton-cards">
            <div class="goal-detail__skeleton-card" />
            <div class="goal-detail__skeleton-card" />
            <div class="goal-detail__skeleton-card" />
          </div>

          <!-- Carousel -->
          <div class="goal-detail__skeleton-carousel" />

          <!-- Projection card -->
          <div class="goal-detail__skeleton-chart" />

          <!-- Movements table -->
          <div class="goal-detail__skeleton-movements">
            <div class="goal-detail__skeleton-movements-header" />
            <div v-for="i in 5" :key="i" class="goal-detail__skeleton-movements-row" />
          </div>
        </div>

        <!-- Sidebar skeleton delegated to component -->
        <aside class="goal-detail__sidebar">
          <GoalSidebarPanel :loading="true" />
        </aside>
      </div>
    </template>

    <!-- Header -->
    <div v-else-if="goal" class="goal-detail__header">
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

    <div v-if="!isLoading && goal" class="goal-detail__content">
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

          <GoalInfoCarousel />

          <!-- Deadline at risk banner -->
          <div v-if="isDeadlineAtRisk" class="goal-detail__deadline-banner">
            <div class="goal-detail__deadline-banner-left">
              <span class="material-symbols-outlined goal-detail__deadline-banner-icon">
                schedule
              </span>
              <div>
                <Text size="sm" weight="semibold" class="goal-detail__deadline-banner-title">
                  La fecha objetivo puede no alcanzarse
                </Text>
                <Text size="xs" color="muted">
                  Al ritmo actual, llegarías a tu meta aproximadamente el
                  <strong>{{ estimatedCompletionLabel }}</strong>
                  . Considera aumentar tu aporte mensual o ajustar la fecha.
                </Text>
              </div>
            </div>
            <div class="goal-detail__deadline-banner-actions">
              <Button size="sm" variant="primary" icon="add" @click="openContributionModal">
                Hacer aporte
              </Button>
              <Button size="sm" variant="ghost" icon="edit" @click="openEditModal">
                Ajustar fecha
              </Button>
            </div>
          </div>

          <!-- Interest registration banner (between cards and chart) -->
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
              variant="secondary"
              :loading="isRegisteringInterest"
              @click="handleRegisterInterest"
            >
              Registrar
            </Button>
          </div>

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

          <GoalMovements :goal-id="goalId" :movements="allMovements" />
        </ResponsiveContainer>

        <!-- Sidebar -->
        <aside class="goal-detail__sidebar">
          <GoalSidebarPanel
            :goal="goal"
            :history="history"
            :account="account"
            :progress-percentage="progressPercentage"
            :saved-amount="totalSavedForGoal"
            :total-deposited="totalDeposited"
            :total-interest="presentedInterest"
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
      <ContributionForm :goal-id="goalId" @on-close="handleContributionSuccess" />
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

  /* Deadline at risk banner */
  .goal-detail__deadline-banner {
    @apply flex flex-wrap items-start justify-between gap-4 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3;
    @apply dark:border-warning-700/50 dark:bg-warning-900/20;
  }

  .goal-detail__deadline-banner-left {
    @apply flex items-start gap-3;
  }

  .goal-detail__deadline-banner-icon {
    @apply mt-0.5 shrink-0 text-warning-600 dark:text-warning-400;
  }

  .goal-detail__deadline-banner-title {
    @apply text-warning-800 dark:text-warning-300;
  }

  .goal-detail__deadline-banner-actions {
    @apply flex shrink-0 gap-2;
  }

  /* Interest banner */
  .goal-detail__interest-banner {
    @apply flex items-center justify-between gap-4 rounded-lg border border-secondary-300 bg-secondary-50 px-4 py-3;
    @apply dark:border-secondary-700/50 dark:bg-secondary-900/20;
  }

  .goal-detail__interest-banner-info {
    @apply flex items-center gap-3;
  }

  .goal-detail__interest-banner-icon {
    @apply text-secondary-600 dark:text-secondary-400;
  }

  /* Layout Principal */
  .goal-detail__layout {
    @apply flex flex-col gap-6 px-4 lg:flex-row lg:items-start lg:px-0;
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
    @apply bg-primary-900 text-white hover:bg-primary-900 focus:ring-primary-500;
    @apply dark:bg-primary-600 dark:hover:bg-primary-600;
  }

  /* Skeleton */
  .goal-detail__skeleton-header {
    @apply flex w-full items-center justify-between gap-4 p-4;
  }

  .goal-detail__skeleton-title {
    @apply h-9 w-56 animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-actions {
    @apply flex items-center gap-2;
  }

  .goal-detail__skeleton-btn {
    @apply h-8 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-cards {
    @apply grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3;
  }

  .goal-detail__skeleton-card {
    @apply h-24 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-carousel {
    @apply h-20 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-chart {
    @apply h-80 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-movements {
    @apply flex flex-col gap-3 rounded-xl border border-neutral-100 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800;
  }

  .goal-detail__skeleton-movements-header {
    @apply h-7 w-40 animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-700;
  }

  .goal-detail__skeleton-movements-row {
    @apply h-10 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-neutral-700;
  }
</style>
