import { ref } from 'vue'

import type { BudgetDonutItem } from '@/components/molecules/budget-donut-chart/types/budget-donut-chart.types'
import { useBudgetStore } from '@/stores/budget.store'
import { useExpensesStore } from '@/stores/expense.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import type { Budget } from '@/types/domain'

/**
 * Application composable for budget comparison across periods
 * Handles fetching and aggregating spent data for current and previous budgets
 */
export function useBudgetComparisonApplication() {
  const budgetStore = useBudgetStore()
  const expensesStore = useExpensesStore()
  const plannedSavingStore = usePlannedSavingStore()

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get previous budget based on current budget period
   * @param currentBudget - Current budget
   * @returns Previous budget or null
   */
  const getPreviousBudget = (currentBudget: Budget | null): Budget | null => {
    if (!currentBudget) return null

    const { year, month } = currentBudget.period
    const previousMonth = month === 1 ? 12 : month - 1
    const previousYear = month === 1 ? year - 1 : year

    return (
      budgetStore.budgets.find(
        budget => budget.period.year === previousYear && budget.period.month === previousMonth
      ) ?? null
    )
  }

  /**
   * Calculate spent amounts by category for a given budget
   * @param budgetId - Budget ID
   * @param items - Budget donut items
   * @returns Map of category type to spent amount
   */
  const calculateSpentByCategory = async (
    budgetId: string,
    items: BudgetDonutItem[]
  ): Promise<Record<string, number>> => {
    try {
      // Fetch expenses for this budget if not already loaded
      if (expensesStore.filters.budgetId !== budgetId) {
        expensesStore.setBudget(budgetId)
        const { fetchExpenses } = await import('./useExpenseApplication')
        await fetchExpenses().fetchExpenses()
      }

      // Fetch planned savings for this budget
      await plannedSavingStore.fetchByBudget(budgetId)

      const spentData: Record<string, number> = {}

      // Calculate spent for needs and wants from expenses
      items.forEach(item => {
        if (item.type === 'needs' || item.type === 'wants') {
          const categoryExpenses = expensesStore.expenses.filter(
            expense => expense.bucket === item.type && expense.status === 'PAID'
          )
          spentData[item.id] = categoryExpenses.reduce(
            (total, expense) => total + Number(expense.expectedAmount || 0),
            0
          )
        } else if (item.type === 'savings') {
          // Calculate spent for savings from planned savings
          spentData[item.id] = plannedSavingStore.totalSavingGenerated || 0
        }
      })

      return spentData
    } catch (err) {
      console.error('Error calculating spent by category:', err)
      error.value = 'Error al calcular los gastos por categoría'
      return {}
    }
  }

  /**
   * Get spent data for current budget
   * @param items - Budget donut items
   * @returns Map of category ID to spent amount
   */
  const getCurrentSpentData = async (items: BudgetDonutItem[]): Promise<Record<string, number>> => {
    const currentBudget = budgetStore.currentBudget
    if (!currentBudget?.id) return {}

    return await calculateSpentByCategory(currentBudget.id, items)
  }

  /**
   * Get spent data for previous budget period
   * @param items - Budget donut items
   * @returns Map of category ID to spent amount, or undefined if no previous budget
   */
  const getPreviousSpentData = async (
    items: BudgetDonutItem[]
  ): Promise<Record<string, number> | undefined> => {
    const currentBudget = budgetStore.currentBudget
    const previousBudget = getPreviousBudget(currentBudget)

    if (!previousBudget?.id) return undefined

    return await calculateSpentByCategory(previousBudget.id, items)
  }

  /**
   * Load comparison data for current and previous periods
   * @param items - Budget donut items
   * @returns Object with current and previous spent data
   */
  const loadComparisonData = async (items: BudgetDonutItem[]) => {
    isLoading.value = true
    error.value = null

    try {
      const [currentSpent, previousSpent] = await Promise.all([
        getCurrentSpentData(items),
        getPreviousSpentData(items)
      ])

      return {
        currentSpent,
        previousSpent
      }
    } catch (err) {
      console.error('Error loading comparison data:', err)
      error.value = 'Error al cargar datos de comparación'
      return {
        currentSpent: {},
        previousSpent: undefined
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    getPreviousBudget,
    getCurrentSpentData,
    getPreviousSpentData,
    loadComparisonData
  }
}
