<script setup lang="ts">
  import { usePlannedIncome } from '@/composables/usePlannedIncome'
  import { useBudgetStore } from '@/stores/budget.store'
  import { useFinancesStore } from '@/stores/finances.store'
  import { usePlannedSavingStore } from '@/stores/planned-saving.store'
  import { useTransactionStore } from '@/stores/transaction.store'

  import type { BudgetInsightsData } from './types'

  const financesStore = useFinancesStore()
  const budgetStore = useBudgetStore()
  const transactionStore = useTransactionStore()
  const plannedSavingStore = usePlannedSavingStore()

  const currency = computed(() => financesStore.defaultCurrency)
  const plan = computed(() => budgetStore.budgetSelected)
  const { budgetStatus } = useCommon()
  const { expenses } = useExpense()

  // --- PLANNED (base estática del mes) ---
  const { expectedAmount, savingsAmount, needsAmount, wantsAmount } = usePlannedIncome()

  // --- REAL (crece al recibir ingresos) ---
  const receivedIncome = computed(() => transactionStore.totalIncomeReceived)

  const generatedSavings = computed(() => plannedSavingStore.totalSavingGenerated)

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
      ? Math.round(
          ((generatedSavings.value - plannedSavingStore.totalSavingPending) /
            generatedSavings.value) *
            100
        )
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
  <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
    <template v-if="budgetStatus === 'PLANNED'">
      <FinancialProgressCard v-for="card in plannedCards" :key="card.id" v-bind="card" />
    </template>
    <template v-else>
      <FinancialProgressCard v-for="card in activeCards" :key="card.id" v-bind="card" />
    </template>
  </div>
</template>
