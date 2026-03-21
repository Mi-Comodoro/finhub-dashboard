import { usePlannedIncomeStore } from '@/stores/planned-income.store'

type PlannedIncomeData = {
  id: string
  amount: number
  source: string
  date: Date
  status: 'PENDING' | 'RECEIVED' | 'SKIPPED'
  budgetId: string
  updatedAt: Date
}
export const usePlannedIncomes = () => {
  const plannedIncomeStore = usePlannedIncomeStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  const expectedIncome = ref(0)
  const savingsAmount = computed(() =>
    percentOf(
      expectedIncome.value,
      budgetStore.currentBudgetPlan?.limits.savings ?? 0,
      financesStore.defaultCurrency
    )
  )
  const needsAmount = computed(() =>
    percentOf(
      expectedIncome.value,
      budgetStore.currentBudgetPlan?.limits.needs ?? 0,
      financesStore.defaultCurrency
    )
  )
  const wantsAmount = computed(() =>
    percentOf(
      expectedIncome.value,
      budgetStore.currentBudgetPlan?.limits.wants ?? 0,
      financesStore.defaultCurrency
    )
  )
  const { summary, isLoading, error } = storeToRefs(plannedIncomeStore)
  const fetchPlannedIncomeByBudgetId = async (budgedId: string) => {
    try {
      plannedIncomeStore.setLoading(true)
      plannedIncomeStore.setError(null)
      const { success, result } = await $fetch<{
        success: boolean
        result: PlannedIncomeData[]
      }>(`/api/incomes/planned/${budgedId}`)

      if (success) {
        expectedIncome.value = getExpectedAmount(result)
        plannedIncomeStore.setExpectedIncome(expectedIncome.value)
        plannedIncomeStore.setBucket({
          needs: needsAmount.value,
          wants: wantsAmount.value,
          savings: savingsAmount.value
        })
        plannedIncomeStore.setSummary(result)
        plannedIncomeStore.setBudgetId(budgedId)
      }
      return { success, result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching incomes'
      plannedIncomeStore.setError(errorMessage)
      return { success: false, result: null }
    } finally {
      plannedIncomeStore.setLoading(false)
    }
  }
  const getExpectedAmount = (result: PlannedIncomeData[]) => {
    return result.reduce((acc, b) => acc + Number(b.amount), 0)
  }

  return { summary, isLoading, error, fetchPlannedIncomeByBudgetId }
}
