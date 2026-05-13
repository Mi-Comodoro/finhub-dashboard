import { useCategoryApi } from '@/composables/api/useCategoryApi'
import { useTransactionApi } from '@/composables/api/useTransactionApi'
import { useBudgetStore } from '@/stores/budget.store'
import { useCategoryStore } from '@/stores/categories.store'
import { useFinancesStore } from '@/stores/finances.store'
import type { Currency } from '@/utils/currency'
import type { TransactionSummary } from '~/types/domain'

export interface ExpenseItem extends TransactionSummary {
  categoryType?: string
}

export function useAnalyticsExpensesApplication() {
  const transactionApi = useTransactionApi()
  const categoryApi = useCategoryApi()
  const budgetStore = useBudgetStore()
  const categoryStore = useCategoryStore()
  const financesStore = useFinancesStore()

  const ensureBudgetsLoaded = async (year: number) => {
    if (!budgetStore.budgetPlans.length) {
      const { useBudgetActions } = await import('./useBudgetActions')
      const { fetchBudgets } = useBudgetActions()
      await fetchBudgets(financesStore.financeId, year)
    }
  }

  const ensureCategoriesLoaded = async () => {
    if (!categoryStore.categories.length) {
      const response = await categoryApi.getCategories()
      if (response.success && response.result) categoryStore.setCategories(response.result)
    }
  }

  const fetchExpensesByPeriod = async (year: number, month: number): Promise<ExpenseItem[]> => {
    await ensureBudgetsLoaded(year)
    await ensureCategoriesLoaded()

    const budget = budgetStore.budgetPlans.find(
      b => Number(b.month) === month && Number(b.year) === year
    )

    if (!budget) return []

    const query = new URLSearchParams({ type: 'expense', limit: '500' }).toString()
    const { success, result } = await transactionApi.getTransactionsByBudget(budget.id, query)

    if (!success || !result) return []

    const categoryTypeMap = new Map(categoryStore.categories.map(c => [c.id, c.type]))

    return result.transactions.map(t => ({
      ...t,
      categoryType: t.category?.id ? categoryTypeMap.get(t.category.id) : undefined,
    }))
  }

  const currency = computed(() => financesStore.defaultCurrency as Currency)

  return { fetchExpensesByPeriod, currency }
}
