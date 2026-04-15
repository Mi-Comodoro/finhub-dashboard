import { computed } from 'vue'

import { useBudgetActions } from '@/composables/application/useBudgetActions'
import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'

export function useBudgetDetailApplication() {
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const { fetchBudgetById } = useBudgetActions()
  const { fetchPlannedIncomeByBudgetId } = usePlannedIncomeApplication()

  const loadBudgetDetail = async (budgetId: string) => {
    await fetchBudgetById(budgetId)
    await fetchPlannedIncomeByBudgetId(budgetId)

    const error = (budgetStore.error || plannedIncomeStore.error) as {
      status: number
      title: string
      message: string
    } | null

    return {
      success: !error,
      error
    }
  }

  const markExpenseAsPaid = async (expenseId: string) => {
    const { useExpenseApplication } = await import('./useExpenseApplication')
    const { completeExpense } = useExpenseApplication()
    const { success } = await completeExpense(expenseId)
    return { success }
  }

  const budgetSelected = computed(() => budgetStore.budgetSelected)
  const expectedIncome = computed(() => plannedIncomeStore.expectedIncome)
  const defaultCurrency = computed(() => financesStore.defaultCurrency)

  return {
    loadBudgetDetail,
    markExpenseAsPaid,
    budgetSelected,
    expectedIncome,
    defaultCurrency
  }
}
