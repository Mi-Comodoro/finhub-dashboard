<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import VChart from 'vue-echarts'
  import { useRouter } from 'vue-router'

  import AlertBanner from '@/components/atoms/alert-banner/AlertBanner.vue'
  import Badge from '@/components/atoms/badge/Badge.vue'
  import Button from '@/components/atoms/button/Button.vue'
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import DashboardActionCard from '@/components/business/dashboard/DashboardActionCard.vue'
  import DashboardSidebarPanel from '@/components/business/dashboard/DashboardSidebarPanel.vue'
  import PlanStatusCard from '@/components/business/dashboard/PlanStatusCard.vue'
  import QuickTransactionForm from '@/components/business/transaction/forms/QuickTransactionForm.vue'
  import FinancialProgressCard from '@/components/molecules/financial-progress-card/FinancialProgressCard.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'
  import OnboardingWizard from '@/components/organisms/wizard/OnboardingWizard.vue'
  import { useAccountsPayableApplication } from '@/composables/application/useAccountsPayableApplication'
  import { useAnalyticsApplication } from '@/composables/application/useAnalyticsApplication'
  import { useDashboardApplication } from '@/composables/application/useDashboardApplication'
  import { useGoalsApplication } from '@/composables/application/useGoalsApplication'
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { useSetupApplication } from '@/composables/application/useSetupApplication'
  import { useCommon } from '@/composables/useCommon'
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'
  import { CHART_COLORS } from '@/utils/design-tokens'

  const DashboardBalanceChart = defineAsyncComponent(
    () => import('@/components/business/dashboard/DashboardBalanceChart.vue')
  )

  const router = useRouter()

  const {
    loadDashboardData,
    currency,
    totalCommittedExpenses,
    expenses,
    totalSavingGenerated,
    totalSavingTarget,
    totalTransactionSavings,
    totalIncomeReceived,
    totalPlanned,
    totalExpensesPaid
  } = useDashboardApplication()

  const {
    budgetMissingMessage,
    budgetWarningMessage,
    budgetNextMessage,
    isUsingPreviousBudget,
    isUsingNextBudget,
    load,
    handleCompleteSetup,
    openOnboarding
  } = useSetupApplication()
  const { currentBudget, budgetStatus } = useCommon()

  const { expectedAmount, buckets } = usePlannedIncomeApplication()

  const { goals, accounts, loadGoalsData } = useGoalsApplication()
  const { accounts: payableAccounts } = useAccountsPayableApplication()

  const { healthScore } = useAnalyticsApplication()

  const isPageLoading = ref(true)
  const showQuickModal = ref(false)

  const openQuickModal = () => {
    showQuickModal.value = true
  }

  const closeQuickModal = () => {
    showQuickModal.value = false
  }
  const upcomingBills = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const fromExpenses = (expenses.value ?? [])
      .filter(e => e.status === 'PLANNED')
      .map(e => {
        const due = new Date(e.dueDate)
        due.setHours(0, 0, 0, 0)
        return {
          id: e.id,
          name: e.name,
          amount: Number(e.expectedAmount),
          daysUntilDue: Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          isEssential: e.isEssential,
          type: 'planned_expense' as const
        }
      })

    const fromPayables = (payableAccounts.value ?? [])
      .filter(a => (a.status === 'active' || a.status === 'overdue') && a.nextPaymentDate)
      .map(a => {
        const due = new Date(a.nextPaymentDate!)
        due.setHours(0, 0, 0, 0)
        return {
          id: a.id,
          name: a.name,
          amount: Number(a.minimumPayment ?? a.currentBalance),
          daysUntilDue: Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          isEssential: true,
          type: 'accounts_payable' as const
        }
      })

    return [...fromExpenses, ...fromPayables]
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 5)
  })

  const incomeBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? totalIncomeReceived.value : expectedAmount.value
  )

  // Same formula used by the KPI: 20% of actual income base
  const suggestedSavings = computed(() => {
    if (!currentBudget.value) return buckets.value.savingsAmount
    return percentOf(incomeBase.value, currentBudget.value.limits.savings, currency.value)
  })

  // Actual savings commitment: all non-skipped plans (includes spontaneous)
  const actualSavingsCommitment = computed(() =>
    totalSavingTarget.value > 0 ? totalSavingTarget.value : buckets.value.savingsAmount
  )

  // PLANNED → planned savings completed, ACTIVE/CLOSED → actual savings transactions
  const realSavings = computed(() =>
    budgetStatus.value === 'PLANNED' ? totalSavingGenerated.value : totalTransactionSavings.value
  )

  // LIBRE uses actual commitment so spontaneous savings are deducted
  const savingsBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? actualSavingsCommitment.value : buckets.value.savingsAmount
  )

  const expense = computed(() =>
    subtractAmounts(incomeBase.value, savingsBase.value, currency.value)
  )

  const available = computed(() =>
    subtractAmounts(expense.value, totalCommittedExpenses.value, currency.value)
  )

  const categories = computed(() => {
    if (!currentBudget.value || (!incomeBase.value && !expectedAmount.value)) return []

    const base = incomeBase.value || 0
    const currentCurrency = currency.value
    const budgetExpenses = expenses.value ?? []
    const isActive = budgetStatus.value === 'ACTIVE'

    const needsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'needs')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const wantsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'wants')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const savingsSpent = isActive ? actualSavingsCommitment.value : realSavings.value || 0

    return [
      {
        id: 'needs',
        name: 'Gastos Fijos',
        type: 'needs' as const,
        budgeted: percentOf(base, currentBudget.value.limits.needs, currentCurrency),
        spent: needsSpent,
        percentage: currentBudget.value.limits.needs
      },
      {
        id: 'wants',
        name: 'Gastos Variables u Ocasionales',
        type: 'wants' as const,
        budgeted: percentOf(base, currentBudget.value.limits.wants, currentCurrency),
        spent: wantsSpent,
        percentage: currentBudget.value.limits.wants
      },
      {
        id: 'savings',
        name: 'Ahorro e Inversiones',
        type: 'savings' as const,
        budgeted: percentOf(base, currentBudget.value.limits.savings, currentCurrency),
        spent: savingsSpent,
        percentage: currentBudget.value.limits.savings
      }
    ]
  })

  const strategyDonutOption = computed(() => {
    if (!currentBudget.value) return {}
    const { needs, wants, savings } = currentBudget.value.limits
    return {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${p.name}: <strong>${p.value}%</strong>`
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          data: [
            { value: needs, name: 'Gastos Fijos', itemStyle: { color: '#14b8a6' } },
            {
              value: wants,
              name: 'Gastos Variables',
              itemStyle: { color: CHART_COLORS.secondary }
            },
            { value: savings, name: 'Ahorro', itemStyle: { color: CHART_COLORS.savings } }
          ],
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
          label: { fontSize: 11, formatter: '{b}\n{d}%' }
        }
      ]
    }
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
    ssr: false,
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
            :variant="
              budgetStatus === 'PLANNED'
                ? 'warning'
                : budgetStatus === 'CLOSED'
                  ? 'default'
                  : 'secondary'
            "
            class-name="uppercase"
          >
            {{
              budgetStatus === 'PLANNED'
                ? 'Planificado'
                : budgetStatus === 'CLOSED'
                  ? 'Cerrado'
                  : 'En Ejecucion'
            }}
          </Badge>
        </div>
        <Text size="xs" color="muted">
          Conoce el estado de tus finanzas y toma decisiones inteligentes con datos en tiempo real.
        </Text>
      </div>
      <div class="dashboard-page__header-actions">
        <Button variant="ghost" size="sm" icon="download" disabled>Reporte</Button>

        <Button
          v-if="budgetStatus === 'ACTIVE'"
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

    <AlertBanner
      v-else-if="isUsingNextBudget"
      title="Mes actual cerrado"
      variant="info"
      icon="info"
    >
      <Text size="sm">
        {{ budgetNextMessage }}
      </Text>
    </AlertBanner>

    <div class="dashboard-page__layout">
      <!-- Contenido principal -->
      <div class="dashboard-page__main">
        <div v-if="isPageLoading" class="dashboard-page__loading">
          <div class="dashboard-page__skeleton-cards">
            <div v-for="item in 3" :key="item" class="dashboard-page__skeleton" />
          </div>
          <div class="dashboard-page__skeleton dashboard-page__skeleton--chart" />
          <div class="dashboard-page__skeleton dashboard-page__skeleton--section" />
        </div>

        <div v-else-if="expectedAmount" class="dashboard-page__cards">
          <FinancialProgressCard
            :title="'Ingresos'"
            :amount="incomeBase || 0"
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
            :amount="Number(suggestedSavings) || 0"
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
            variant="custom"
            icon-text-class="text-primary-600"
            icon-bg-class="bg-primary-100"
            class="dashboard-page__card--free"
          />
        </div>

        <section v-if="!isPageLoading && currentBudget">
          <DashboardBalanceChart
            :expected-income="Number(expectedAmount) || 0"
            :received-income="totalIncomeReceived || 0"
            :estimated-savings="buckets.savingsAmount || 0"
            :generated-savings="realSavings || 0"
            :planned-expenses="totalPlanned || 0"
            :paid-expenses="totalExpensesPaid || 0"
            :currency="currency"
          />
        </section>

        <section v-if="currentBudget">
          <div class="dashboard-page__budget-header">
            <Heading level="h3" size="lg" weight="semibold">
              {{
                budgetStatus === 'PLANNED'
                  ? 'Planificación del Presupuesto'
                  : 'Estado del Presupuesto'
              }}
            </Heading>
            <Badge
              :variant="currentBudget?.strategy === 'BALANCED' ? 'primary' : 'secondary'"
              :class-name="
                currentBudget?.strategy === 'BALANCED' ? '!bg-primary-900 !text-primary-100' : ''
              "
            >
              {{ currentBudget?.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada' }}
            </Badge>
          </div>

          <div class="dashboard-page__budget-body">
            <div class="dashboard-page__budget-donut">
              <div class="dashboard-page__budget-donut-header">
                <Text size="sm" weight="bold" color="black">Distribución del ingreso</Text>
                <Text size="xs" color="muted">
                  {{ budgetStatus === 'PLANNED' ? 'Ingreso planificado' : 'Ingreso recibido' }}:
                  {{ formatCurrency(incomeBase, currency) }}
                </Text>
              </div>
              <ClientOnly>
                <VChart :option="strategyDonutOption" style="height: 240px" autoresize />
              </ClientOnly>
            </div>

            <div class="dashboard-page__budget-kpis">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="dashboard-page__budget-kpi"
                :class="`dashboard-page__budget-kpi--${cat.type}`"
              >
                <Text size="xs" color="muted">{{ cat.name }}</Text>
                <Heading level="h2" size="lg" weight="extrabold">
                  {{ formatCurrency(cat.budgeted, currency) }}
                </Heading>
                <div class="dashboard-page__budget-track">
                  <div
                    class="dashboard-page__budget-fill"
                    :class="`dashboard-page__budget-fill--${cat.type}`"
                    :style="{
                      width:
                        cat.budgeted > 0
                          ? `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%`
                          : '0%'
                    }"
                  />
                </div>
                <div class="dashboard-page__budget-kpi-footer">
                  <Text size="xs" color="muted">
                    {{ cat.percentage }}% del
                    {{ budgetStatus === 'PLANNED' ? 'ing. planificado' : 'ing. recibido' }}
                  </Text>
                  <Text size="xs" weight="medium">
                    {{ formatCurrency(cat.spent, currency) }}
                    {{ budgetStatus === 'PLANNED' ? 'estimado' : 'ejecutado' }}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div v-if="!isPageLoading && !currentBudget" class="dashboard-page__no-budget">
          <EmptyStateIllustration type="no-budget" class="dashboard-page__no-budget-illustration" />
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
      </div>

      <!-- Sidebar derecho -->
      <div class="dashboard-page__sidebar">
        <DashboardActionCard
          v-if="!isPageLoading && expectedAmount"
          :budget-status="budgetStatus"
          :free-amount="available"
          :currency-code="currency"
          @define-goals="router.push('/dashboard/goals')"
          @add-to-goal="router.push('/dashboard/goals')"
          @plan-expenses="router.push(`/dashboard/budget/${currentBudget?.id}`)"
          @carry-forward="router.push('/dashboard/budget')"
        />
        <DashboardSidebarPanel
          :health-score="healthScore"
          :goals="goals"
          :bills="upcomingBills"
          :loading="isPageLoading"
          :planned-savings="buckets.savingsAmount || 0"
          :suggested-savings="suggestedSavings || 0"
          :real-savings="realSavings || 0"
          :currency="currency"
        />
        <PlanStatusCard v-if="!isPageLoading" />
      </div>
    </div>

    <ModalWizard :show="openOnboarding" class="dashboard-page__modal">
      <OnboardingWizard @completed="handleCompleteSetup" />
    </ModalWizard>

    <ModalWizard v-model:show="showQuickModal">
      <QuickTransactionForm
        :goals="goals"
        :accounts="accounts"
        :budget-savings-percentage="currentBudget?.limits?.savings ?? 20"
        :currency="currency"
        @on-close="closeQuickModal"
      />
    </ModalWizard>
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-page {
    @apply flex flex-col gap-4 px-4 py-2;
  }

  .dashboard-page__layout {
    @apply flex flex-col gap-4 xl:grid xl:grid-cols-[1fr_288px] xl:items-start;
  }

  .dashboard-page__main {
    @apply flex min-w-0 flex-col gap-4;
  }

  .dashboard-page__sidebar {
    @apply flex flex-col gap-4;
  }

  .dashboard-page__header {
    @apply flex items-center justify-between;
  }

  .dashboard-page__header-text {
    @apply md:pr-4 xl:pr-0;
  }

  .dashboard-page__header-title-wrapper {
    @apply flex items-center gap-2;
  }

  .dashboard-page__title {
    @apply mb-1;
  }

  .dashboard-page__header-actions {
    @apply flex items-center gap-2;
  }

  .dashboard-page__loading {
    @apply flex w-full flex-col gap-4;
  }

  .dashboard-page__skeleton-cards {
    @apply grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3;
  }

  .dashboard-page__skeleton {
    @apply h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800;
  }

  .dashboard-page__skeleton--chart {
    @apply h-[300px];
  }

  .dashboard-page__skeleton--section {
    @apply h-48;
  }

  .dashboard-page__cards {
    @apply grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3;
  }

  .dashboard-page__card--accent {
    @apply !bg-primary-900;
    @apply dark:!bg-primary-700;
  }

  .dashboard-page__card--free {
    border-left: 3px solid theme('colors.primary.500');
    @apply !bg-primary-50;
    @apply dark:!bg-neutral-800;
  }

  .dashboard-page__budget-header {
    @apply flex items-center justify-between;
  }

  .dashboard-page__budget-body {
    @apply mt-3 grid grid-cols-1 gap-4 md:grid-cols-[2fr_3fr];
  }

  .dashboard-page__budget-donut {
    @apply flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .dashboard-page__budget-donut-header {
    @apply flex flex-col gap-0.5;
  }

  .dashboard-page__budget-kpis {
    @apply flex flex-col gap-3;
  }

  .dashboard-page__budget-kpi {
    @apply flex flex-col gap-1.5 rounded-xl border p-4;
  }

  .dashboard-page__budget-kpi--needs {
    @apply border-primary-100 bg-primary-50;
    @apply dark:border-primary-900/40 dark:bg-primary-900/20;
  }

  .dashboard-page__budget-kpi--wants {
    @apply border-secondary-100 bg-secondary-50;
    @apply dark:border-secondary-900/40 dark:bg-secondary-900/20;
  }

  .dashboard-page__budget-kpi--savings {
    @apply border-warning-100 bg-warning-50;
    @apply dark:border-warning-900/40 dark:bg-warning-900/20;
  }

  .dashboard-page__budget-track {
    @apply h-2 w-full overflow-hidden rounded-full bg-white/60;
    @apply dark:bg-white/10;
  }

  .dashboard-page__budget-fill {
    @apply h-full rounded-full transition-all duration-700;
  }

  .dashboard-page__budget-fill--needs {
    @apply bg-primary-500;
  }

  .dashboard-page__budget-fill--wants {
    @apply bg-secondary-500;
  }

  .dashboard-page__budget-fill--savings {
    @apply bg-warning-500;
  }

  .dashboard-page__budget-kpi-footer {
    @apply flex items-center justify-between;
  }

  .dashboard-page__no-budget {
    @apply rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800;
  }

  .dashboard-page__no-budget-illustration {
    @apply mx-auto mb-4 max-w-[140px];
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
    @apply w-full;
  }
</style>
