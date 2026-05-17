import { computed, ref } from 'vue'

import { useExpenseApi } from '@/composables/api/useExpenseApi'
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
  const expenseApi = useExpenseApi()

  // Distribution totals fetched without pagination to avoid partial reads
  const needsSpent = ref(0)
  const wantsSpent = ref(0)

  const loadBudgetDetail = async (budgetId: string) => {
    await fetchBudgetById(budgetId)
    await fetchPlannedIncomeByBudgetId(budgetId)

    try {
      const { result } = await expenseApi.findAllExpenses({ budgetId, status: 'PAID', limit: 1000 })
      if (result?.data) {
        needsSpent.value = result.data
          .filter(e => e.bucket === 'needs')
          .reduce((sum, e) => sum + Number(e.expectedAmount ?? 0), 0)
        wantsSpent.value = result.data
          .filter(e => e.bucket === 'wants')
          .reduce((sum, e) => sum + Number(e.expectedAmount ?? 0), 0)
      }
    } catch {
      needsSpent.value = 0
      wantsSpent.value = 0
    }

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
    defaultCurrency,
    needsSpent,
    wantsSpent
  }
}
