<script setup lang="ts">
  import { format } from 'date-fns'
  import { es } from 'date-fns/locale'

  import { Badge, Button } from '@/components/atoms'
  import { AlertBanner } from '@/components/atoms/alert-banner'
  import GoalProjectionChart from '@/components/business/savings/GoalProjectionChart.vue'
  import { useSavingsApi } from '@/composables/api/useSavingsApi'
  import { useAccountStore } from '@/stores/account.store'
  import { useBudgetStore } from '@/stores/budget.store'
  import { usePlannedSavingStore } from '@/stores/planned-saving.store'
  import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
  import type { GoalHistory, GoalsData } from '@/types/api'
  import { projectCompoundGrowth } from '@/utils/compound-interest.utils'
  import { formatCurrency } from '@/utils/currency'
  import { getGoalTerm, GOAL_STATUS_LABELS, type GoalStatus } from '@/utils/goals.utils'

  definePageMeta({
    layout: 'dashboard',
    title: 'Detalle de Meta',
    breadcrumb: 'Detalle'
  })

  const route = useRoute()
  const goalId = computed(() => route.params.id as string)

  const savingsApi = useSavingsApi()
  const accountStore = useAccountStore()
  const budgetStore = useBudgetStore()
  const allocationsStore = useSavingAllocationsStore()
  const plannedSavingStore = usePlannedSavingStore()

  // State
  const goal = ref<GoalsData | null>(null)
  const history = ref<GoalHistory[]>([])
  const isLoading = ref(false)
  const selectedHorizon = ref<12 | 24 | 36>(12)

  // Fetch data
  const loadGoalDetail = async () => {
    if (!goalId.value) return
    isLoading.value = true
    try {
      const [goalResponse, historyResponse] = await Promise.all([
        savingsApi.getGoal(goalId.value),
        savingsApi.getGoalHistory(goalId.value)
      ])

      if (goalResponse.success) {
        goal.value = goalResponse.result
      }
      if (historyResponse.success) {
        history.value = historyResponse.result
      }

      // Load accounts and allocations if needed
      if (accountStore.accounts.length === 0) {
        await accountStore.fetchAccounts()
      }
      const currentBudgetId = budgetStore.currentBudgetPlan?.id
      if (currentBudgetId && allocationsStore.savingAllocations.length === 0) {
        await allocationsStore.fetchSavingAllocations(currentBudgetId)
      }
    } catch (error) {
      console.error('Error loading goal detail:', error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    await loadGoalDetail()

    // Load planned savings for the current budget if not loaded
    const currentBudgetId = budgetStore.currentBudgetPlan?.id
    if (!plannedSavingStore.items && currentBudgetId) {
      await plannedSavingStore.fetchByBudget(currentBudgetId)
    }
  })

  // Computed
  const account = computed(() => {
    if (!goal.value) return null
    return accountStore.accounts.find(a => a.id === goal.value!.accountId)
  })

  const allocation = computed(() => {
    if (!goal.value) return null
    return allocationsStore.savingAllocations.find(a => a.goalId === goal.value!.id)
  })

  const currentBalance = computed(() => account.value?.balance ?? 0)

  const progressPercentage = computed(() => {
    if (!goal.value?.targetAmount || goal.value.targetAmount === 0) return 0
    return Math.min(100, Math.round((totalSavedForGoal.value / goal.value.targetAmount) * 100))
  })

  const savingsAmount = computed(() => budgetStore.currentBudgetPlan?.savingsAmount ?? 0)

  // Planned savings for this goal
  const goalSavings = computed(() =>
    (plannedSavingStore.items ?? []).filter(s => s.savingGoalId === goal.value?.id)
  )

  const completedSavings = computed(() =>
    goalSavings.value.filter(s => s.status === 'completed')
  )

  const totalSavedForGoal = computed(() =>
    completedSavings.value.reduce((acc, s) => acc + Number(s.amount), 0)
  )

  const firstSavingDate = computed(() => {
    const completed = completedSavings.value
    if (!completed.length) return null
    return completed.reduce((earliest, s) =>
      new Date(s.date) < new Date(earliest.date) ? s : earliest
    ).date
  })

  // Mes de inicio real (1-indexed, relativo al año actual)
  const startMonth = computed(() => {
    if (!firstSavingDate.value) return 1
    return new Date(firstSavingDate.value).getMonth() + 1
  })

  const monthlyContribution = computed(() => {
    const allocation = allocationsStore.savingAllocations.find(a => a.goalId === goal.value?.id)
    if (allocation && savingsAmount.value > 0)
      return (savingsAmount.value * allocation.percentage) / 100
    if (completedSavings.value.length > 0)
      return totalSavedForGoal.value / completedSavings.value.length
    return 0
  })

  const projectionData = computed(() => {
    // Fallback: si no hay cuenta, usar tasa 0
    const interestRate = account.value?.interestRate ?? 0
    const frequency = account.value?.compoundingFrequency ?? 'monthly'

    // Usar totalSavedForGoal como principal (ya calculado)
    const principal = totalSavedForGoal.value

    // Contribución mensual
    const allocation = allocationsStore.savingAllocations.find(a => a.goalId === goal.value?.id)
    const contribution =
      allocation && savingsAmount.value > 0
        ? (savingsAmount.value * Number(allocation.percentage)) / 100
        : completedSavings.value.length > 0
          ? principal / completedSavings.value.length
          : 0

    // Siempre calcular aunque principal=0 si hay contribution
    if (principal === 0 && contribution === 0) return []

    return projectCompoundGrowth({
      principal,
      monthlyContribution: contribution,
      annualRate: interestRate,
      compoundingFrequency: frequency as 'daily' | 'monthly' | 'quarterly' | 'annually',
      months: selectedHorizon.value
    })
  })

  const baseAccumulation = computed(() => {
    const principal = totalSavedForGoal.value
    const contribution = monthlyContribution.value
    return Array.from({ length: selectedHorizon.value }, (_, i) =>
      Math.round(principal + contribution * (i + 1))
    )
  })

  const estimatedInterest = computed(() => {
    const acc = account.value
    if (!acc?.interestRate || acc.interestRate <= 0) return 0

    const periodsPerYear: Record<string, number> = {
      daily: 365,
      monthly: 12,
      quarterly: 4,
      annually: 1
    }
    const n = periodsPerYear[acc.compoundingFrequency ?? 'monthly'] ?? 12
    const ratePerPeriod = Math.pow(1 + acc.interestRate / 100, 1 / n) - 1

    // Acumular interés desde cada aporte
    // Cada saving completado genera interés desde su completedAt hasta hoy
    const today = new Date()
    let totalInterest = 0

    completedSavings.value.forEach(saving => {
      const from = saving.completedAt ? new Date(saving.completedAt) : new Date(saving.date)
      const days = Math.max(
        Math.floor((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)),
        0
      )
      // Interés compuesto: capital × ((1 + r)^días - 1)
      const interest = Number(saving.amount) * (Math.pow(1 + ratePerPeriod, days) - 1)
      totalInterest += interest
    })

    return Math.round(totalInterest * 100) / 100 // 2 decimales
  })

  const withInterest = computed(() => projectionData.value.map(p => p.balance))

  const goalTerm = computed(() => {
    if (!goal.value) return 'none'
    return getGoalTerm(goal.value.targetDate)
  })

  const termLabel = computed(() => {
    const labels = {
      short: 'Corto plazo',
      medium: 'Mediano plazo',
      long: 'Largo plazo',
      none: 'Sin plazo'
    }
    return labels[goalTerm.value as keyof typeof labels]
  })

  const statusLabel = computed(() => {
    const status = (goal.value?.status ?? 'SCHEDULED') as GoalStatus
    return GOAL_STATUS_LABELS[status]
  })

  const currency = 'COP' as const

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es })
  }
</script>

<template>
  <div class="goal-detail">
    <!-- Header -->
    <div class="goal-detail__header">
      <div v-if="goal" class="goal-detail__title-section">
        <Heading level="h1" size="2xl" weight="extrabold">{{ goal.name }}</Heading>
        <div class="goal-detail__badges">
          <Badge :text="statusLabel" variant="info" size="sm" />
          <Badge :text="termLabel" variant="secondary" size="sm" />
          <Badge v-if="account" :text="account.name" variant="primary" size="sm" />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="goal-detail__loading">
      <Text>Cargando...</Text>
    </div>

    <div v-else-if="goal" class="goal-detail__content">
      <!-- Progreso actual -->
      <Card v-if="goal.targetAmount" class="goal-detail__progress-card">
        <div class="goal-detail__progress-header">
          <Heading level="h2" size="lg" weight="bold">Progreso Actual</Heading>
          <Text size="sm" color="muted">
            {{ formatCurrency(totalSavedForGoal, currency) }} de {{ formatCurrency(goal.targetAmount, currency) }}
          </Text>
        </div>
        <div class="goal-detail__progress-bar">
          <div
            class="goal-detail__progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <Text size="xs" color="muted" class="goal-detail__progress-text">
          {{ progressPercentage }}% completado
        </Text>
      </Card>

      <!-- Aportes realizados -->
      <Card class="goal-detail__savings-card">
        <Heading level="h3" size="lg" weight="bold">Aportes realizados</Heading>

        <div v-if="goalSavings.length === 0" class="goal-detail__savings-empty">
          <Text size="sm" color="muted">Sin aportes registrados aún</Text>
        </div>

        <div v-else class="goal-detail__savings-list">
          <div v-for="saving in goalSavings" :key="saving.id" class="goal-detail__saving-item">
            <div class="goal-detail__saving-info">
              <Text size="sm" weight="bold">
                {{ formatCurrency(saving.amount, currency) }}
              </Text>
              <Text size="xs" color="muted">
                {{ formatDate(String(saving.date)) }}
              </Text>
            </div>
            <Badge :variant="saving.status === 'completed' ? 'success' : 'warning'" size="xs">
              {{ saving.status === 'completed' ? 'Realizado' : 'Pendiente' }}
            </Badge>
          </div>

          <!-- Total -->
          <div class="goal-detail__saving-total">
            <Text size="sm" color="muted">Total aportado</Text>
            <Text size="sm" weight="bold">
              {{ formatCurrency(totalSavedForGoal, currency) }}
            </Text>
          </div>

          <!-- Interés estimado del período -->
          <div v-if="estimatedInterest > 0" class="goal-detail__interest-row">
            <Text size="sm" color="muted">Interés estimado del período</Text>
            <Text size="sm" weight="bold" class="goal-detail__interest-value">
              + {{ formatCurrency(estimatedInterest, currency) }}
            </Text>
          </div>
        </div>
      </Card>

      <!-- Proyección de crecimiento -->
      <Card class="goal-detail__projection-card">
        <div class="goal-detail__projection-header">
          <Heading level="h2" size="lg" weight="bold">Proyección de Crecimiento</Heading>
          <div class="goal-detail__horizon-toggle">
            <button
              v-for="months in [12, 24, 36]"
              :key="months"
              :class="[
                'goal-detail__horizon-btn',
                { 'goal-detail__horizon-btn--active': selectedHorizon === months }
              ]"
              @click="selectedHorizon = months as 12 | 24 | 36"
            >
              {{ months }}m
            </button>
          </div>
        </div>

        <GoalProjectionChart
          :base-data="baseAccumulation"
          :interest-data="withInterest"
          :months="selectedHorizon"
          :start-month="startMonth"
          :target-amount="goal?.targetAmount ?? undefined"
          :currency="currency"
        />

        <!-- Disclaimer -->
        <AlertBanner variant="warning" icon="info">
          Las proyecciones son estimadas y pueden variar según las actualizaciones de tasa de
          interés por parte de las entidades financieras.
        </AlertBanner>
      </Card>

      <!-- Historial de cambios -->
      <Card class="goal-detail__history-card">
        <Heading level="h2" size="lg" weight="bold" class="goal-detail__history-title">
          Historial de Cambios
        </Heading>
        <div v-if="history.length > 0" class="goal-detail__history-list">
          <div v-for="item in history" :key="item.id" class="goal-detail__history-item">
            <span class="goal-detail__history-bullet">●</span>
            <span class="goal-detail__history-date">{{ formatDate(item.changedAt) }}</span>
            <span class="goal-detail__history-text">
              <strong>{{ item.field }}:</strong>
              {{ item.oldValue ?? 'N/A' }} → {{ item.newValue }}
            </span>
          </div>
        </div>
        <Text v-else size="sm" color="muted" class="goal-detail__history-empty">
          Sin cambios registrados
        </Text>
      </Card>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .goal-detail {
    @apply space-y-6;
  }

  .goal-detail__header {
    @apply space-y-4;
  }

  .goal-detail__title-section {
    @apply space-y-2;
  }

  .goal-detail__badges {
    @apply flex flex-wrap gap-2;
  }

  .goal-detail__loading {
    @apply flex items-center justify-center py-20;
  }

  .goal-detail__content {
    @apply space-y-6;
  }

  /* Progress Card */
  .goal-detail__progress-card {
    @apply space-y-4;
  }

  .goal-detail__progress-header {
    @apply flex items-center justify-between;
  }

  .goal-detail__progress-bar {
    @apply h-4 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700;
  }

  .goal-detail__progress-fill {
    @apply h-full bg-primary-500 transition-all duration-300;
  }

  .goal-detail__progress-text {
    @apply text-right;
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

  .goal-detail__projection-empty {
    @apply flex h-40 items-center justify-center;
  }

  .goal-detail__chart {
    @apply w-full;
  }

  /* History Card */
  .goal-detail__history-card {
    @apply space-y-4;
  }

  .goal-detail__history-title {
    @apply mb-4;
  }

  .goal-detail__history-list {
    @apply space-y-3;
  }

  .goal-detail__history-item {
    @apply flex items-start gap-2 text-sm;
  }

  .goal-detail__history-bullet {
    @apply text-primary-500;
  }

  .goal-detail__history-date {
    @apply text-neutral-500 dark:text-neutral-400;
  }

  .goal-detail__history-text {
    @apply flex-1 text-neutral-700 dark:text-neutral-200;
  }

  .goal-detail__history-empty {
    @apply text-center;
  }

  /* Savings Card */
  .goal-detail__savings-card {
    @apply space-y-4;
  }

  .goal-detail__savings-empty {
    @apply py-4 text-center;
  }

  .goal-detail__savings-list {
    @apply space-y-3;
  }

  .goal-detail__saving-item {
    @apply flex items-center justify-between border border-neutral-200 rounded-lg p-3 dark:border-neutral-700;
  }

  .goal-detail__saving-info {
    @apply flex flex-col gap-1;
  }

  .goal-detail__saving-total {
    @apply flex items-center justify-between border-t border-neutral-300 pt-3 mt-2 dark:border-neutral-600;
  }

  .goal-detail__interest-row {
    @apply flex items-center justify-between pt-2;
  }

  .goal-detail__interest-value {
    @apply text-success-600;
  }
</style>
