<script setup lang="ts">
  import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { useBudgetInsightsPresenter } from '@/composables/presenters/useBudgetInsightsPresenter'

  import type { BudgetInsightsData } from './types'

  withDefaults(defineProps<{
    budgetStatus?: 'PLANNED' | 'ACTIVE' | 'CLOSED'
  }>(), {
    budgetStatus: 'PLANNED'
  })
  const { currency, plan, receivedIncome, generatedSavings, pendingSavings } =
    useBudgetInsightsPresenter()

  const { expenses } = useExpenseApplication()

  // --- PLANNED (base estática del mes) ---
  const { expectedAmount, savingsAmount, needsAmount, wantsAmount } = usePlannedIncomeApplication()

  // --- REAL (crece al recibir ingresos) ---

  const actualAvailableBase = computed(() =>
    subtractAmounts(receivedIncome.value, generatedSavings.value, currency.value)
  )

  const committedExpenses = computed(() => expenses.value)

  const freeUncommitted = computed(() =>
    subtractAmounts(actualAvailableBase.value, committedExpenses.value, currency.value)
  )

  // --- Porcentajes de progreso ---
  const pctIncomeReceived = computed(() =>
    expectedAmount.value > 0 ? Math.round((receivedIncome.value / expectedAmount.value) * 100) : 0
  )

  const pctSavingsExecuted = computed(() =>
    generatedSavings.value > 0
      ? Math.round(((generatedSavings.value - pendingSavings.value) / generatedSavings.value) * 100)
      : 0
  )

  // --- Cards fase PLANNED ---
  const plannedCards = computed<BudgetInsightsData[]>(() => [
    {
      id: 'expected-income',
      title: 'Ingreso esperado',
      amount: expectedAmount.value,
      currencyCode: currency.value,
      iconName: 'account_balance_wallet',
      variant: 'primary'
    },
    {
      id: 'estimated-savings',
      title: 'Ahorro estimado',
      subtitle: `${plan.value?.limits?.savings ?? 0}% del ingreso`,
      amount: savingsAmount.value,
      currencyCode: currency.value,
      iconName: 'savings',
      variant: 'gold'
    },
    {
      id: 'fixed-expenses',
      title: 'Para necesidades',
      subtitle: `50% del ingreso`,
      amount: needsAmount.value,
      currencyCode: currency.value,
      iconName: 'home',
      variant: 'warning'
    },
    {
      id: 'variable-expenses',
      title: 'Para gustos',
      subtitle: `30% del ingreso`,
      amount: wantsAmount.value,
      currencyCode: currency.value,
      iconName: 'shopping_bag',
      variant: 'secondary'
    }
  ])

  // --- Cards fase ACTIVE ---
  const activeCards = computed<BudgetInsightsData[]>(() => [
    {
      id: 'received-income',
      title: 'Ingreso recibido',
      subtitle: `${pctIncomeReceived.value}% de lo Esperado`,
      amount: receivedIncome.value,
      currencyCode: currency.value,
      iconName: 'account_balance_wallet',
      variant: 'primary',
      percentage: pctIncomeReceived.value
    },
    {
      id: 'generated-savings',
      title: 'Ahorro Generado',
      subtitle: `${pctSavingsExecuted.value}% Ejecutado`,
      amount: generatedSavings.value,
      currencyCode: currency.value,
      iconName: 'savings',
      variant: 'gold'
    },
    {
      id: 'available-base',
      title: 'Base para gastos',
      subtitle: 'Recibido − Ahorro Generado',
      amount: actualAvailableBase.value,
      currencyCode: currency.value,
      iconName: 'home',
      variant: 'warning'
    },
    {
      id: 'free-uncommitted',
      title: 'Libre sin comprometer',
      subTitleColor: 'white',
      titleColor: 'white',
      textColor: 'white',
      subtitle: `${formatCurrency(committedExpenses.value, currency.value)} Planificado`,
      amount: freeUncommitted.value,
      currencyCode: currency.value,
      iconName: 'account_balance',
      variant: 'accent'
    }
  ])
</script>

<template>
  <div class="budget-insights">
    <template v-if="budgetStatus === 'PLANNED'">
      <FinancialProgressCard v-for="card in plannedCards" :key="card.id" v-bind="card" />
    </template>
    <template v-else>
      <FinancialProgressCard v-for="card in activeCards" :key="card.id" v-bind="card" />
    </template>
  </div>
</template>

<style scoped lang="postcss">
  .budget-insights {
    @apply grid w-full grid-cols-1 gap-4 md:grid-cols-2;
  }
</style>
