import { computed } from 'vue'

import { useExpensesStore } from '@/stores/expense.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
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
  const plannedIncomeStore = usePlannedIncomeStore()

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

  // Planned expenses need something to be backed by: expected income or an available balance.
  // Without either, the planned-expenses section is disabled (the server enforces the same rule).
  // The expected income in the store belongs to the last budget loaded, so it only counts when it
  // is the budget being viewed. While it is still loading we do not block anything.
  const canPlanExpenses = (budgetId: string) => {
    if (plannedIncomeStore.isLoading) return true
    const expected =
      plannedIncomeStore.budgetId === budgetId ? (plannedIncomeStore.expectedIncome ?? 0) : 0
    return expected > 0 || available.value > 0
  }

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
    canPlanExpenses,
    committedExpenses,
    committedSavings,
    committed,
    plannedSavingsTarget,
    savingsExecutedPct,
    unplannedExpenses
  }
}
