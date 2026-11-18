<script setup lang="ts">
  import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
  import { useBudgetBalancePresenter } from '@/composables/presenters/useBudgetBalancePresenter'
  import { useBudgetInsightsPresenter } from '@/composables/presenters/useBudgetInsightsPresenter'

  import type { BudgetInsightsData } from './types'

  withDefaults(
    defineProps<{
      budgetStatus?: 'PLANNED' | 'ACTIVE' | 'CLOSED'
    }>(),
    {
      budgetStatus: 'PLANNED'
    }
  )
  const { plan, receivedIncome } = useBudgetInsightsPresenter()
  const {
    currency,
    realSavings: generatedSavings,
    available,
    committed,
    savingsExecutedPct: pctSavingsExecuted
  } = useBudgetBalancePresenter()

  // --- PLANNED (base estática del mes) ---
  const { expectedAmount, savingsAmount, needsAmount, wantsAmount } = usePlannedIncomeApplication()

  // --- Porcentajes de progreso ---
  const pctIncomeReceived = computed(() =>
    expectedAmount.value > 0 ? Math.round((receivedIncome.value / expectedAmount.value) * 100) : 0
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
      id: 'committed',
      title: 'Comprometido',
      subtitle: 'Gastos y ahorro planificados pendientes',
      amount: committed.value,
      currencyCode: currency.value,
      iconName: 'event_upcoming',
      variant: 'warning'
    },
    {
      id: 'available',
      title: 'Disponible',
      titleColor: 'white',
      textColor: 'white',
      subTitleColor: 'white',
      subtitle: 'Ingresos − gastos − ahorros reales',
      amount: available.value,
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
