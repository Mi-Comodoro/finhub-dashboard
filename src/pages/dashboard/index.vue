<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { AlertBanner, Badge, Button, Heading, Text } from '@/components/atoms'
  import { DashboardBalanceChart, FinancialTipCarousel } from '@/components/business'
  import { BudgetDonutChartEnhanced, FinancialProgressCard } from '@/components/molecules'
  import { OnboardingWizard } from '@/components/organisms'
  import { ModalWizard } from '@/components/organisms/modal-wizard'
  import { useBudgetInsights } from '@/composables/useBudgetInsights'
  import { useCommon } from '@/composables/useCommon'
  import { usePlannedIncome } from '@/composables/usePlannedIncome'
  import { useSetup } from '@/composables/useSetup'
  import { useExpensesStore } from '@/stores/expense.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedSavingStore } from '@/stores/planned-saving.store'
  import { useTransactionStore } from '@/stores/transaction.store'
  import { formatCurrency, percentOf, subtractAmounts } from '@/utils/currency'
  import { FINANCIAL_TIPS } from '@/utils/financial-tips'

  const router = useRouter()

  const financesStore = useFinancesStore()
  const transactionStore = useTransactionStore()
  const expensesStore = useExpensesStore()
  const plannedSavingStore = usePlannedSavingStore()

  const {
    budgetMissingMessage,
    budgetWarningMessage,
    isUsingPreviousBudget,
    load,
    handleCompleteSetup,
    openOnboarding
  } = useSetup()
  const { currentBudget, budgetStatus } = useCommon()

  const { expectedAmount, buckets } = usePlannedIncome()

  const isPageLoading = ref(true)
  const { ingresoRecibido, ahorroGenerado } = useBudgetInsights()

  const currency = computed(() => financesStore.defaultCurrency)
  const totalExpenses = computed(() => expensesStore.totalPaid)

  const incomeBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? ingresoRecibido.value : expectedAmount.value
  )

  const savingsBase = computed(() =>
    budgetStatus.value === 'ACTIVE' ? ahorroGenerado.value : buckets.value.savingsAmount
  )

  const available = computed(() =>
    subtractAmounts(
      subtractAmounts(incomeBase.value, savingsBase.value, currency.value),
      totalExpenses.value,
      currency.value
    )
  )

  const categories = computed(() => {
    if (!currentBudget.value || !expectedAmount.value) return []

    const currentCurrency = currency.value
    const budgetExpenses = expensesStore.expenses ?? []

    const needsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'needs')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const wantsSpent = budgetExpenses
      .filter(expense => expense.status === 'PAID' && expense.bucket === 'wants')
      .reduce((total, expense) => total + Number(expense.expectedAmount || 0), 0)

    const savingsSpent = plannedSavingStore.totalSavingGenerated || 0

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
        expensesStore.setBudget(currentBudget.value.id)

        await Promise.all([
          transactionStore.fetchByBudget(currentBudget.value.id, { limit: 100 }),
          expensesStore.fetchExpenses(),
          plannedSavingStore.fetchByBudget(currentBudget.value.id)
        ])
      }
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
  <div class="space-y-4 p-4">
    <div class="flex items-center justify-between">
      <div class="md:pr-4 xl:pr-0">
        <div class="mb-2 flex items-center gap-2">
          <Heading level="h1" size="2xl" weight="extrabold" class="mb-1">
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
      <div v-if="budgetStatus !== 'PLANNED'" class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon="download"
          @click="router.push('/dashboard/reports')"
        >
          Reporte
        </Button>
        <Button variant="primary" size="sm" icon="add">Nueva Transaccion</Button>
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

    <div
      v-if="isPageLoading"
      class="mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <div
        v-for="item in 4"
        :key="item"
        class="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
      />
    </div>

    <div
      v-else-if="expectedAmount"
      class="mb-8 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      <FinancialProgressCard
        :title="'Ingresos'"
        :amount="expectedAmount"
        title-color="white"
        text-color="white"
        icon-name="account_balance_wallet"
        icon-text-class="text-primary-500"
        currency-text-class="text-neutral-400"
        class="!bg-primary-900"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Ahorro Sugerido/Mes'"
        :amount="buckets.savingsAmount"
        title-color="white"
        text-color="white"
        icon-name="savings"
        icon-text-class="text-primary-500"
        currency-text-class="text-neutral-400"
        class="!bg-primary-900"
        variant="accent"
      />
      <FinancialProgressCard
        :title="'Disponible'"
        :amount="available"
        title-color="white"
        text-color="white"
        icon-name="payments"
        icon-text-class="text-primary-500"
        currency-text-class="text-neutral-400"
        class="!bg-primary-900"
        variant="accent"
      />

      <FinancialProgressCard
        v-if="budgetStatus === 'PLANNED'"
        title-color="white"
        text-color="white"
        icon-mark="savings"
        icon-text-class="text-primary-500"
      >
        <template #body>
          <div class="flex flex-col justify-between">
            <div class="p-1">
              <Text color="muted" size="sm" class="leading-relaxed">
                Ahora es el momento de definir como vas a ahorrar tu
                <strong>{{ currentBudget?.limits.savings }}%</strong>
              </Text>
            </div>
            <div class="z-10 flex items-center justify-end gap-2">
              <Button size="sm" @click="router.push(`/dashboard/goals`)">Definir Metas</Button>
            </div>
          </div>
        </template>
      </FinancialProgressCard>
      <FinancialProgressCard
        v-else
        title-color="white"
        text-color="white"
        icon-mark="savings"
        icon-text-class="text-primary-500"
      >
        <template #body>
          <div class="flex flex-col justify-between">
            <div class="p-1">
              <Text color="muted" size="sm" class="leading-relaxed">
                El Presupuesto esta en
                <strong>Ejecucion</strong>
                , puedes gestionar tu presupesto
              </Text>
            </div>
            <div class="z-10 flex items-center justify-end gap-2">
              <Button size="sm" @click="router.push(`/dashboard/budget/${currentBudget?.id}`)">
                Ver Presupuesto
              </Button>
            </div>
          </div>
        </template>
      </FinancialProgressCard>
    </div>
    <FinancialTipCarousel :tips="FINANCIAL_TIPS.common" />

    <div v-if="currentBudget" class="mb-8 grid grid-cols-1 xl:grid-cols-2">
      <div
        class="rounded-md border border-slate-200 bg-white transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <Heading level="h3" size="lg" weight="semibold">
            {{
              budgetStatus === 'PLANNED'
                ? 'Planificacion del Presupuesto'
                : 'Estado del Presupuesto'
            }}
          </Heading>
          <Badge
            size="sm"
            class="ml-2"
            :variant="currentBudget?.strategy === 'BALANCED' ? 'primary' : 'secondary'"
          >
            {{ currentBudget?.strategy === 'BALANCED' ? '50/30/20' : 'Personalizada' }}
          </Badge>
        </div>

        <div class="flex items-center gap-6 p-5">
          <div class="shrink-0">
            <ClientOnly>
              <BudgetDonutChartEnhanced
                :items="categories"
                :total="expectedAmount"
                :currency="currency"
                :show-legend="false"
                :show-trends="true"
                :show-health-indicators="false"
                :enable-hover-details="true"
                :comparison-enabled="true"
              />
              <template #fallback>
                <div class="h-44 w-44 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
              </template>
            </ClientOnly>
          </div>

          <div class="min-w-0 flex-1 space-y-4">
            <div v-for="cat in categories" :key="cat.id" class="space-y-1.5">
              <div class="flex items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    :class="[
                      'h-3 w-3 shrink-0 rounded-full',
                      cat.type === 'needs'
                        ? 'bg-primary-500'
                        : cat.type === 'wants'
                          ? 'bg-secondary-500'
                          : 'bg-warning-500'
                    ]"
                  />
                  <Text size="sm" class="truncate">
                    {{ cat.name }}
                    <span class="text-slate-400">({{ cat.percentage }}%)</span>
                  </Text>
                </div>
                <Text size="sm" weight="semibold" class="shrink-0">
                  {{ formatCurrency(cat.budgeted, currency) }}
                </Text>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-700',
                    cat.type === 'needs'
                      ? 'bg-primary-500'
                      : cat.type === 'wants'
                        ? 'bg-secondary-500'
                        : 'bg-warning-500'
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

      <div v-if="!isPageLoading && expectedAmount" class="mt-4">
        <DashboardBalanceChart
          :expected-income="expectedAmount"
          :received-income="transactionStore.totalIncomeReceived || 0"
          :estimated-savings="buckets.savingsAmount || 0"
          :generated-savings="plannedSavingStore.totalSavingGenerated || 0"
          :planned-expenses="expensesStore.totalPlanned || 0"
          :paid-expenses="transactionStore.totalExpensesPaid || 0"
          :currency="currency"
        />
      </div>
    </div>

    <div
      v-else-if="!isPageLoading"
      class="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <Heading level="h3" size="lg" weight="semibold" class="mb-2">
        No hay un presupuesto cargado para mostrar
      </Heading>
      <Text size="sm" color="muted" class="mx-auto max-w-2xl">
        {{
          budgetMissingMessage ||
          'Todavia no encontramos un presupuesto disponible para este periodo. Revisa tus presupuestos y crea manualmente el nuevo mes cuando corresponda.'
        }}
      </Text>
      <div class="mt-4 flex justify-center">
        <Button size="sm" @click="router.push('/dashboard/budget')">Ir a Presupuestos</Button>
      </div>
    </div>

    <ModalWizard :show="openOnboarding" class="px-8">
      <OnboardingWizard ref="wizardRef" @completed="handleCompleteSetup" />
    </ModalWizard>
  </div>
</template>

<style scoped></style>
