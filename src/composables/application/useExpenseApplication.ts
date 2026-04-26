import { useExpenseApi } from '@/composables/api/useExpenseApi'
import { useExpensesStore } from '@/stores/expense.store'
import { getPercentage } from '@/utils/currency'
import type { ExpenseData } from '~/types/domain'

import { usePlannedIncomeApplication } from './usePlannedIncomeApplication'

// Business logic: filtrar parámetros activos
const getActiveFilters = (filters: {
  budgetId: string
  search: string
  status: string
  bucket: string
  page: number
  limit: number
}) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== null && value !== undefined
    })
  )
}

export const useExpenseApplication = () => {
  const { needsAmount, wantsAmount } = usePlannedIncomeApplication()
  const store = useExpensesStore()
  const expenseApi = useExpenseApi()

  const expenses = computed(() =>
    store.expenses
      .filter(expense => expense.bucket)
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const needsAmountCompleted = computed(() =>
    store.expenses
      .filter(item => item.status === 'PAID' && item.bucket === 'needs')
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const wantsAmountCompleted = computed(() =>
    store.expenses
      .filter(item => item.status === 'PAID' && item.bucket === 'wants')
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const wantsProgress = computed(() =>
    getPercentage(needsAmount.value, wantsAmountCompleted.value ?? 0)
  )
  const needsProgress = computed(() =>
    getPercentage(needsAmount.value, needsAmountCompleted.value ?? 0)
  )

  // Orchestration: fetch expenses
  const fetchExpenses = async () => {
    try {
      store.setLoading(true)
      const activeFilters = getActiveFilters(store.filters)
      const { result } = await expenseApi.findAllExpenses(activeFilters)

      store.setExpenses(result.data)
      store.setMeta(result.meta)
    } catch (err) {
      console.error(err)
      store.setError('Error cargando gastos')
    } finally {
      store.setLoading(false)
    }
  }

  // Orchestration: add expense
  const addExpense = async (data: ExpenseData) => {
    store.setLoading(true)
    const { success } = await expenseApi.createExpense(data)

    store.setLoading(false)
    if (!success) {
      store.setError('Error al crear gastos planificados')
    }
    await fetchExpenses()
    return success
  }

  // Orchestration: complete expense
  const completeExpense = async (id: string) => {
    try {
      store.setLoading(true)

      const { success, result } = await expenseApi.completeExpense(id)

      if (success && result) {
        store.updateExpenseStatus(id, result.plannedExpense.status)
      }

      return { success, result }
    } catch (err) {
      console.error(err)
      store.setError('Error al marcar gasto como pagado')
      return { success: false, result: null }
    } finally {
      store.setLoading(false)
    }
  }

  // Orchestration: update expense
  const updateExpense = async (id: string, data: Partial<ExpenseData>) => {
    try {
      store.setLoading(true)
      const { success } = await expenseApi.updateExpense(id, data)

      if (!success) {
        store.setError('Error al actualizar gasto planificado')
      }

      await fetchExpenses()
      return { success }
    } catch (err) {
      console.error(err)
      store.setError('Error al actualizar gasto planificado')
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  // Orchestration: delete expense
  const deleteExpense = async (id: string) => {
    try {
      store.setLoading(true)
      const { success } = await expenseApi.deleteExpense(id)

      if (!success) {
        store.setError('Error al eliminar gasto planificado')
      }

      await fetchExpenses()
      return { success }
    } catch (err) {
      console.error(err)
      store.setError('Error al eliminar gasto planificado')
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  return {
    expenses,
    needsProgress,
    wantsProgress,
    needsAmount,
    wantsAmount,
    fetchExpenses,
    addExpense,
    completeExpense,
    updateExpense,
    deleteExpense
  }
}
