import { computed } from 'vue'

import { useExpensesStore } from '@/stores/expense.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import { useTransactionStore } from '@/stores/transaction.store'
import { addAmounts, subtractAmounts } from '@/utils/currency'

/**
 * Single source of truth for the balance figures shown on Dashboard and Budget detail.
 *
 * - Available (Disponible)   = real income - real expenses - real savings
 *   (same rule used by the expense form to validate balance).
 * - Committed (Comprometido) = pending planned expenses + pending planned savings.
 */
export function useBudgetBalancePresenter() {
  const transactionStore = useTransactionStore()
  const expensesStore = useExpensesStore()
  const plannedSavingStore = usePlannedSavingStore()
  const financesStore = useFinancesStore()

  const currency = computed(() => financesStore.defaultCurrency)

  const realIncome = computed(
    () => transactionStore.totals?.income ?? transactionStore.totalIncomeReceived
  )
  const realExpenses = computed(
    () => transactionStore.totals?.expense ?? transactionStore.totalExpensesPaid
  )
  const realSavings = computed(
    () => transactionStore.totals?.savings ?? transactionStore.totalSavings
  )

  const available = computed(() =>
    subtractAmounts(
      subtractAmounts(realIncome.value ?? 0, realExpenses.value ?? 0, currency.value),
      realSavings.value ?? 0,
      currency.value
    )
  )

  const committedExpenses = computed(() => expensesStore.totalPlanned ?? 0)
  const committedSavings = computed(() => plannedSavingStore.totalSavingPending ?? 0)
  const committed = computed(() =>
    addAmounts(committedExpenses.value, committedSavings.value, currency.value)
  )

  // Planned savings target (pending + completed, excluding skipped)
  const plannedSavingsTarget = computed(() => plannedSavingStore.totalSavingTarget ?? 0)

  // Real savings executed vs. planned target (0-100+)
  const savingsExecutedPct = computed(() => {
    const target = plannedSavingsTarget.value
    if (target <= 0) return 0
    return Math.round(((realSavings.value ?? 0) / target) * 100)
  })

  // Real expenses not linked to a planned expense (e.g. spontaneous spending)
  const unplannedExpenses = computed(() =>
    Math.max(
      0,
      subtractAmounts(realExpenses.value ?? 0, expensesStore.totalPaid ?? 0, currency.value)
    )
  )

  return {
    currency,
    realIncome,
    realExpenses,
    realSavings,
    available,
    committedExpenses,
    committedSavings,
    committed,
    plannedSavingsTarget,
    savingsExecutedPct,
    unplannedExpenses
  }
}
