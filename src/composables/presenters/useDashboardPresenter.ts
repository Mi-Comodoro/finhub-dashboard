import { computed } from 'vue'

import { useExpensesStore } from '@/stores/expense.store'
import { useGoalsStore } from '@/stores/goals.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import { useTransactionStore } from '@/stores/transaction.store'
import { formatCompactCurrency } from '@/utils/currency'

import { useBudgetInsightsPresenter } from './useBudgetInsightsPresenter'

export function useDashboardPresenter() {
  const goalsStore = useGoalsStore()
  const plannedSavingStore = usePlannedSavingStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const transactionStore = useTransactionStore()
  const expensesStore = useExpensesStore()
  const { currency, generatedSavings, receivedPlannedIncome } = useBudgetInsightsPresenter()

  /**
   * True when there is at least one active saving goal (isActive flag).
   * Controls visibility of the "Plan de Ahorro" section.
   */
  const hasActiveSavingPlans = computed(
    () => (goalsStore.goals?.filter(g => g.isActive)?.length ?? 0) > 0
  )

  /**
   * The free amount not yet committed to savings.
   * Derived from received income minus savings generated — presentation only.
   */
  const freeAmount = computed(() => {
    const income = receivedPlannedIncome.value ?? 0
    const savings = generatedSavings.value ?? 0
    return income - savings
  })

  /**
   * Percentage of the saving plan that has been executed (0–100).
   * Derived from total planned savings vs pending savings.
   */
  const savingsExecutedPercentage = computed(() => {
    const total = plannedSavingStore.totalSavingGenerated ?? 0
    const pending = plannedSavingStore.totalSavingPending ?? 0
    if (total <= 0) return 0
    const completed = total - pending
    return Math.round((completed / total) * 100)
  })

  /**
   * Percentage of expected income that has been received (0–100).
   */
  const incomeRate = computed(() => {
    const received = receivedPlannedIncome.value ?? 0
    const expected = plannedIncomeStore.expectedIncome ?? 0
    if (expected <= 0) return 0
    return Math.round((received / expected) * 100)
  })

  /**
   * Percentage of planned expenses that have been paid (0–100).
   */
  const expenseRate = computed(() => {
    const paid = transactionStore.totalExpensesPaid ?? 0
    const totalPlanned = (expensesStore.totalPlanned ?? 0) + (expensesStore.totalPaid ?? 0)
    if (totalPlanned <= 0) return 0
    return Math.round((paid / totalPlanned) * 100)
  })

  /**
   * Composite financial health score (0–100).
   * Weighted: savings 40%, income 30%, expenses 30%.
   */
  const healthScore = computed(() => {
    const savingsPct = savingsExecutedPercentage.value
    const incomePct = incomeRate.value
    const expensePct = expenseRate.value
    const savingsScore = (Math.min(savingsPct, 100) / 100) * 40
    const incomeScore = (Math.min(incomePct, 100) / 100) * 30
    const expenseScore = (Math.min(expensePct, 100) / 100) * 30
    return Math.round(savingsScore + incomeScore + expenseScore)
  })

  /**
   * Alias for savingsExecutedPercentage — used by FinancialHealthGauge.
   */
  const savingsRate = computed(() => savingsExecutedPercentage.value)

  /**
   * Contextual financial tip derived from current budget state.
   * Priority: free amount available > savings fully executed > null (use default tips)
   */
  const contextualTip = computed((): string | null => {
    const free = freeAmount.value ?? 0
    const currentCurrency = currency.value
    if (free > 0) {
      return `Tienes ${formatCompactCurrency(free, currentCurrency)} libres — considera planificar tus gastos o abonar a una meta`
    }
    if ((savingsExecutedPercentage.value ?? 0) >= 100) {
      return '¡Plan de ahorro ejecutado! Considera incrementarlo'
    }
    return 'Ahorra antes de gastar — trata tu ahorro como un gasto fijo mensual'
  })

  return {
    hasActiveSavingPlans,
    freeAmount,
    savingsExecutedPercentage,
    savingsRate,
    incomeRate,
    expenseRate,
    healthScore,
    contextualTip
  }
}
