<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { AlertBanner, Badge, Button, Heading, Text } from '@/components/atoms'
  import {
    ActiveGoalsCard,
    DashboardActionCard,
    DashboardBalanceChart,
    FinancialHealthGauge,
    FinancialTipCarousel,
    PlannedSavingList,
    QuickTransactionForm,
    UpcomingBillsCard
  } from '@/components/business'
  import { BudgetDonutChartEnhanced, FinancialProgressCard } from '@/components/molecules'
  import { OnboardingWizard } from '@/components/organisms'
  import { ModalWizard } from '@/components/organisms/modal-wizard'
  import { useDashboardApplication } from '@/composables/application/useDashboardApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { useSetupApplication } from '@/composables/application/useSetupApplication'
  import { useBudgetInsightsPresenter } from '@/composables/presenters/useBudgetInsightsPresenter'
  import { useDashboardPresenter } from '@/composables/presenters/useDashboardPresenter'
  import { useCommon } from '@/composables/useCommon'
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'
  import { FINANCIAL_TIPS } from '@/utils/financial-tips'

  const router = useRouter()

  const {
    loadDashboardData,
    currency,
    totalExpenses,
    expenses,
    totalSavingGenerated,
    totalIncomeReceived,
    totalPlanned,
    totalExpensesPaid
  } = useDashboardApplication()

  const {
    budgetMissingMessage,
    budgetWarningMessage,
    isUsingPreviousBudget,
    load,
    handleCompleteSetup,
    openOnboarding
  } = useSetupApplication()
  const { currentBudget, budgetStatus } = useCommon()

  const { expectedAmount, buckets } = usePlannedIncomeApplication()

  const { goals, accounts, loadGoalsData } = useGoalsApplication()

  const { hasActiveSavingPlans, contextualTip, healthScore, savingsRate, incomeRate, expenseRate } =
    useDashboardPresenter()

  const isPageLoading = ref(true)
  const showQuickModal = ref(false)

  const openQuickModal = () => {
    showQuickModal.value = true
  }

  const closeQuickModal = () => {
    showQuickModal.value = false
  }
  const { receivedPlannedIncome, generatedSavings } = useBudgetInsightsPresenter()

  const incomeBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? receivedPlannedIncome.value : expectedAmount.value
  )

  const savingsBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? generatedSavings.value : buckets.value.savingsAmount
  )

  const expense = computed(() =>
    subtractAmounts(incomeBase.value, savingsBase.value, currency.value)
  )

  const available = computed(() =>
    subtractAmounts(expense.value, totalExpenses.value, currency.value)
  )

  const displayTips = computed(() => {
    if (!contextualTip.value) return FINANCIAL_TIPS.common
    return [...FINANCIAL_TIPS.common]
  })

  const categories = computed(() => {
    if (!currentBudget.value || !expectedAmount.value) return []

    const currentCurrency = currency.value
    const budgetExpenses = expenses.value ?? []

    const needsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'needs')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const wantsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'wants')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const savingsSpent = totalSavingGenerated.value || 0

    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(
          expectedAmount.value,
          currentBudget.value.limits.needs,
          currentCurrency
        ),
        spent: needsSpent,
        percentage: currentBudget.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants' as const,
        budgeted: percentOf(
          expectedAmount.value,
          currentBudget.value.limits.wants,
          currentCurrency
        ),
        spent: wantsSpent,
        percentage: currentBudget.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(
          expectedAmount.value,
          currentBudget.value.limits.savings,
          currentCurrency
        ),
        spent: savingsSpent,
        percentage: currentBudget.value.limits.savings
      }
    ]
  })

  onMounted(async () => {
    try {
      await load()
      await nextTick()

      if (currentBudget.value?.id) {
        await loadDashboardData(currentBudget.value.id)
      }

      await loadGoalsData()
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
    } finally {
      isPageLoading.value = false
    }
  })

  definePageMeta({
    layout: 'dashboard',
    title: 'Dashboard',
    breadcrumb: 'Dashboard'
  })
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-page__header">
      <div class="dashboard-page__header-text">
        <div class="dashboard-page__header-title-wrapper">
          <Heading level="h1" size="2xl" weight="extrabold" class="dashboard-page__title">
            Tu Plan Financiero
          </Heading>
          <Badge
            bold
            :rounded="false"
            :variant="budgetStatus === 'PLANNED' ? 'warning' : 'secondary'"
            class-name="uppercase"
          >
            {{ budgetStatus === 'PLANNED' ? 'Planificado' : 'En Ejecucion' }}
          </Badge>
        </div>

        <Text size="sm" color="muted">
          Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.
        </Text>
      </div>
      <div class="dashboard-page__header-actions">
        <Button
          v-if="budgetStatus !== 'PLANNED'"
          variant="ghost"
          size="sm"
          icon="download"
          @click="router.push('/dashboard/reports')"
        >
          Reporte
        </Button>

        <Button
          v-if="budgetStatus !== 'PLANNED'"
          variant="primary"
          size="sm"
          icon="add"
          @click="openQuickModal"
        >
          Nueva Transaccion
        </Button>
      </div>
    </div>

    <AlertBanner
      v-if="isUsingPreviousBudget"
      title="Presupuesto desactualizado"
      variant="warning"
      icon="warning"
    >
      <Text size="sm" color="warning">
        {{ budgetWarningMessage }}
      </Text>
    </AlertBanner>

    <AlertBanner
      v-else-if="budgetMissingMessage"
      title="Presupuesto pendiente"
      variant="warning"
      icon="warning"
    >
      <Text size="sm" color="warning">
        {{ budgetMissingMessage }}
      </Text>
    </AlertBanner>

    <div v-if="isPageLoading" class="dashboard-page__loading">
      <div v-for="item in 4" :key="item" class="dashboard-page__skeleton" />
    </div>

    <div v-else-if="expectedAmount" class="dashboard-page__cards">
      <FinancialProgressCard
        :title="'Ingresos'"
        :amount="Number(expectedAmount) || 0"
        title-color="white"
        text-color="white"
        icon-name="account_balance_wallet"
        icon-text-class="text-yellow-400"
        currency-text-class="text-yellow-400"
        class="dashboard-page__card--accent"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Ahorro Sugerido/Mes'"
        :amount="Number(buckets.savingsAmount) || 0"
        title-color="white"
        text-color="white"
        icon-name="savings"
        icon-text-class="text-yellow-400"
        currency-text-class="text-yellow-400"
        class="dashboard-page__card--accent"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Libre Sin Comprometer'"
        :amount="available"
        title-color="black"
        text-color="black"
        icon-name="payments"
        icon-text-class="text-primary-600"
        icon-bg-class="bg-primary-100"
        class="dashboard-page__card--free"
      />

      <DashboardActionCard
        :budget-status="budgetStatus"
        :free-amount="available"
        :currency-code="currency"
        @define-goals="router.push('/dashboard/goals')"
        @add-to-goal="router.push('/dashboard/goals')"
        @plan-expenses="router.push(`/dashboard/budget/${currentBudget?.id}`)"
        @carry-forward="router.push('/dashboard/budget')"
      />
    </div>
    <FinancialTipCarousel :tips="displayTips" />

    <section v-if="!isPageLoading && currentBudget" class="dashboard-page__widgets-section">
      <div class="dashboard-page__widgets-grid">
        <FinancialHealthGauge
          :score="healthScore"
          :savings-rate="savingsRate"
          :income-rate="incomeRate"
          :expense-rate="expenseRate"
          :has-debt-module="false"
        />
        <UpcomingBillsCard :currency-code="currency" />
      </div>
    </section>

    <section v-if="currentBudget" class="dashboard-page__budget-section">
      <div class="dashboard-page__budget-card">
        <div class="dashboard-page__budget-header">
          <Heading level="h3" size="lg" weight="semibold">
            {{
              budgetStatus === 'PLANNED'
                ? 'Planificacion del Presupuesto'
                : 'Estado del Presupuesto'
            }}
          </Heading>
          <Badge
            size="sm"
            class="dashboard-page__budget-badge"
            :variant="currentBudget?.strategy === 'BALANCED' ? 'primary' : 'secondary'"
          >
            {{ currentBudget?.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada' }}
          </Badge>
        </div>

        <div class="dashboard-page__budget-content">
          <div class="dashboard-page__chart-wrapper">
            <ClientOnly>
              <BudgetDonutChartEnhanced
                :items="categories"
                :total="Number(expectedAmount) || 0"
                :currency="currency"
                :show-legend="false"
                :show-trends="true"
                :show-health-indicators="false"
                :enable-hover-details="true"
                :comparison-enabled="true"
              />
              <template #fallback>
                <div class="dashboard-page__chart-skeleton" />
              </template>
            </ClientOnly>
          </div>

          <div class="dashboard-page__categories">
            <div v-for="cat in categories" :key="cat.id" class="dashboard-page__category">
              <div class="dashboard-page__category-header">
                <div class="dashboard-page__category-label">
                  <span
                    :class="[
                      'dashboard-page__category-dot',
                      cat.type === 'needs'
                        ? 'dashboard-page__category-dot--needs'
                        : cat.type === 'wants'
                          ? 'dashboard-page__category-dot--wants'
                          : 'dashboard-page__category-dot--savings'
                    ]"
                  />
                  <Text size="sm" class="dashboard-page__category-name">
                    {{ cat.name }}
                    <span class="dashboard-page__category-percentage">({{ cat.percentage }}%)</span>
                  </Text>
                </div>
                <Text size="sm" weight="semibold" class="dashboard-page__category-amount">
                  {{ formatCurrency(cat.budgeted, currency) }}
                </Text>
              </div>
              <div class="dashboard-page__category-progress">
                <div
                  :class="[
                    'dashboard-page__category-progress-bar',
                    cat.type === 'needs'
                      ? 'dashboard-page__category-progress-bar--needs'
                      : cat.type === 'wants'
                        ? 'dashboard-page__category-progress-bar--wants'
                        : 'dashboard-page__category-progress-bar--savings'
                  ]"
                  :style="{
                    width:
                      cat.budgeted > 0
                        ? `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%`
                        : '0%'
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!isPageLoading && expectedAmount" class="dashboard-page__balance-section">
      <DashboardBalanceChart
        :expected-income="Number(expectedAmount) || 0"
        :received-income="totalIncomeReceived || 0"
        :estimated-savings="buckets.savingsAmount || 0"
        :generated-savings="totalSavingGenerated || 0"
        :planned-expenses="totalPlanned || 0"
        :paid-expenses="totalExpensesPaid || 0"
        :currency="currency"
      />
    </section>

    <section
      v-if="goals && goals.length > 0 && !isPageLoading"
      class="dashboard-page__goals-section"
    >
      <ActiveGoalsCard
        :goals="goals"
        :currency-code="currency"
        @create-goal="router.push('/dashboard/goals')"
        @view-all="router.push('/dashboard/goals')"
      />
    </section>

    <section
      v-if="hasActiveSavingPlans && currentBudget && !isPageLoading"
      class="dashboard-page__saving-plan"
    >
      <PlannedSavingList :budget-id="currentBudget.id" />
    </section>

    <div v-if="!isPageLoading && !currentBudget" class="dashboard-page__no-budget">
      <Heading level="h3" size="lg" weight="semibold" class="dashboard-page__no-budget-title">
        No hay un presupuesto cargado para mostrar
      </Heading>
      <Text size="sm" color="muted" class="dashboard-page__no-budget-text">
        {{
          budgetMissingMessage ||
          'Todavia no encontramos un presupuesto disponible para este periodo. Revisa tus presupuestos y crea manualmente el nuevo mes cuando corresponda.'
        }}
      </Text>
      <div class="dashboard-page__no-budget-action">
        <Button size="sm" @click="router.push('/dashboard/budget')">Ir a Presupuestos</Button>
      </div>
    </div>

    <ModalWizard :show="openOnboarding" class="dashboard-page__modal">
      <OnboardingWizard @completed="handleCompleteSetup" />
    </ModalWizard>

    <ModalWizard v-model:show="showQuickModal">
      <QuickTransactionForm :goals="goals" :accounts="accounts" @on-close="closeQuickModal" />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-page {
    @apply space-y-4 p-4;
  }

  .dashboard-page__header {
    @apply flex items-center justify-between;
  }

  .dashboard-page__header-text {
    @apply md:pr-4 xl:pr-0;
  }

  .dashboard-page__header-title-wrapper {
    @apply mb-2 flex items-center gap-2;
  }

  .dashboard-page__title {
    @apply mb-1;
  }

  .dashboard-page__header-actions {
    @apply flex items-center gap-2;
  }

  .dashboard-page__loading {
    @apply mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4;
  }

  .dashboard-page__skeleton {
    @apply h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .dashboard-page__cards {
    @apply mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4;
  }

  .dashboard-page__card--accent {
    @apply !bg-primary-900;
  }

  .dashboard-page__card--free {
    border-left: 3px solid theme('colors.primary.500');
    @apply !bg-primary-50;
  }

  .dashboard-page__card-body {
    @apply flex flex-col justify-between;
  }

  .dashboard-page__card-content {
    @apply p-1;
  }

  .dashboard-page__card-text {
    @apply leading-relaxed;
  }

  .dashboard-page__card-action {
    @apply z-10 flex items-center justify-end gap-2;
  }

  .dashboard-page__widgets-section {
    @apply mb-8;
  }

  .dashboard-page__widgets-grid {
    @apply grid grid-cols-1 gap-4 md:grid-cols-2;
  }

  .dashboard-page__goals-section {
    @apply mb-8;
  }

  .dashboard-page__budget-section {
    @apply mb-8;
  }

  .dashboard-page__balance-section {
    @apply mb-8;
  }

  .dashboard-page__budget-card {
    @apply rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800 xl:col-span-1;
  }

  .dashboard-page__budget-header {
    @apply flex border-b border-slate-100 px-5 py-4 dark:border-slate-700;
  }

  .dashboard-page__budget-badge {
    @apply ml-2;
  }

  .dashboard-page__budget-content {
    @apply flex items-center gap-6 p-5;
  }

  .dashboard-page__chart-wrapper {
    @apply shrink-0;
  }

  .dashboard-page__chart-skeleton {
    @apply h-44 w-44 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700;
  }

  .dashboard-page__categories {
    @apply min-w-0 flex-1 space-y-4;
  }

  .dashboard-page__category {
    @apply space-y-1.5;
  }

  .dashboard-page__category-header {
    @apply flex items-center justify-between gap-2;
  }

  .dashboard-page__category-label {
    @apply flex min-w-0 items-center gap-2;
  }

  .dashboard-page__category-dot {
    @apply h-3 w-3 shrink-0 rounded-full;
  }

  .dashboard-page__category-dot--needs {
    @apply bg-primary-500;
  }

  .dashboard-page__category-dot--wants {
    @apply bg-secondary-500;
  }

  .dashboard-page__category-dot--savings {
    @apply bg-warning-500;
  }

  .dashboard-page__category-name {
    @apply truncate;
  }

  .dashboard-page__category-percentage {
    @apply text-slate-400;
  }

  .dashboard-page__category-amount {
    @apply shrink-0;
  }

  .dashboard-page__category-progress {
    @apply h-1.5 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  .dashboard-page__category-progress-bar {
    @apply h-full rounded-full transition-all duration-700;
  }

  .dashboard-page__category-progress-bar--needs {
    @apply bg-primary-500;
  }

  .dashboard-page__category-progress-bar--wants {
    @apply bg-secondary-500;
  }

  .dashboard-page__category-progress-bar--savings {
    @apply bg-warning-500;
  }

  .dashboard-page__no-budget {
    @apply rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800;
  }

  .dashboard-page__no-budget-title {
    @apply mb-2;
  }

  .dashboard-page__no-budget-text {
    @apply mx-auto max-w-2xl;
  }

  .dashboard-page__no-budget-action {
    @apply mt-4 flex justify-center;
  }

  .dashboard-page__modal {
    @apply px-8;
  }

  .dashboard-page__saving-plan {
    @apply mb-4;
  }
</style>
