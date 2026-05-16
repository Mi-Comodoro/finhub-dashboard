import { useIncomeApi } from '@/composables/api/useIncomeApi'
import { useBudgetActions } from '@/composables/application/useBudgetActions'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import type { PlannedIncomeSummary } from '~/types/domain'

export function useBudgetListApplication() {
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const { fetchBudgets } = useBudgetActions()
  const incomeApi = useIncomeApi()

  const loadBudgets = async (year: number) => {
    const financeId = financesStore.profile?.id
    if (!financeId) return { success: false }
    await fetchBudgets(financeId, year)
    return { success: !budgetStore.error }
  }

  const loadPlannedIncomes = async (): Promise<PlannedIncomeSummary[]> => {
    const budgetIds = budgetStore.budgetPlans.map(b => b.id)
    if (budgetIds.length === 0) return []
    const results = await Promise.all(budgetIds.map(id => incomeApi.getPlannedIncomesByBudget(id)))
    return results.flatMap(r => r.result ?? [])
  }

  const getExpectedIncomeForBudget = (
    budgetId: string,
    plannedIncomes: PlannedIncomeSummary[]
  ): number =>
    plannedIncomes
      .filter(p => String(p.budgetId) === String(budgetId))
      .reduce((acc, p) => acc + (p.amount ?? 0), 0)

  const budgets = computed(() => budgetStore.budgetPlans)
  const isLoading = computed(() => budgetStore.isLoading)
  const error = computed(() => budgetStore.error)
  const currency = computed(() => financesStore.defaultCurrency)

  return {
    loadBudgets,
    loadPlannedIncomes,
    getExpectedIncomeForBudget,
    budgets,
    isLoading,
    error,
    currency
  }
}
