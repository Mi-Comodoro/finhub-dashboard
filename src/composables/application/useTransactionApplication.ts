import type { FetchError } from 'ofetch'

import { useSavingsApi } from '@/composables/api/useSavingsApi'
import type { TransactionData } from '@/composables/api/useTransactionApi'
import { useTransactionApi } from '@/composables/api/useTransactionApi'
import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
import { useBudgetStore } from '@/stores/budget.store'
import { useCategoryStore } from '@/stores/categories.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedSavingStore } from '@/stores/planned-saving.store'
import type { TransactionFilters } from '~/types/domain'

// Business logic: construir query params
const buildQueryParams = (budgetId: string, filters: Partial<TransactionFilters>): string => {
  const params = new URLSearchParams()

  params.set('budgetId', budgetId)
  if (filters.type) params.set('type', filters.type)
  if (filters.categoryId) params.set('categoryId', filters.categoryId)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return params.toString()
}

// Business logic: manejo de errores
const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message: 'Por seguridad, tu sesión ha caducado. Por favor iniciá sesión nuevamente.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message:
      'Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contactá soporte.'
  }
}

export const useTransactionApplication = () => {
  const transactionStore = useTransactionStore()
  const budgetStore = useBudgetStore()
  const categoryStore = useCategoryStore()
  const financesStore = useFinancesStore()
  const plannedSavingStore = usePlannedSavingStore()
  const categoryApplication = useCategoryApplication()
  const transactionApi = useTransactionApi()
  const savingsApi = useSavingsApi()

  const transactions = computed(() => transactionStore.items)
  const pagination = computed(() => transactionStore.pagination)
  const totals = computed(() => transactionStore.totals)
  const isLoading = computed(() => transactionStore.isLoading)

  // Orchestration: fetch transactions by budget
  const fetchByBudget = async (budgetId: string, filters?: Partial<TransactionFilters>) => {
    try {
      transactionStore.setLoading(true)

      if (budgetId) transactionStore.setBudgetId(budgetId)
      if (filters) transactionStore.setFilters(filters)

      const id = budgetId || transactionStore.budgetId

      if (!id) return { success: false, result: null }

      const query = buildQueryParams(id, transactionStore.filters)

      const { success, result } = await transactionApi.getTransactionsByBudget(id, query)

      if (success && result) {
        transactionStore.setItems(result.transactions)
        if (result.pagination) transactionStore.setPagination(result.pagination)
      }

      return { success, result }
    } catch (err) {
      transactionStore.setError(createErrorMessage(err as FetchError))
      return { success: false, result: null }
    } finally {
      transactionStore.setLoading(false)
    }
  }

  // Orchestration: reload with current filters
  /*   const reload = async () => {
    if (!transactionStore.budgetId) return
    return fetchByBudget(transactionStore.budgetId)
  } */

  const fetchTransaction = async (budgetId: string, filters?: Partial<TransactionFilters>) => {
    await fetchByBudget(budgetId, filters ?? {})
  }

  const fetchTotals = async (budgetId: string, filters?: Partial<TransactionFilters>) => {
    try {
      transactionStore.setTotals(null)
      const query = buildQueryParams(budgetId, { ...filters, page: undefined, limit: undefined })
      const { success, result } = await transactionApi.getTransactionTotals(budgetId, query)
      if (success && result) transactionStore.setTotals(result)
    } catch {
      // totals are non-critical; silently fail
    }
  }

  const setBudgetId = (budgetId: string) => {
    transactionStore.setBudgetId(budgetId)
  }

  const loadInitialData = async (financeId: string, year: number) => {
    try {
      const { useBudgetActions } = await import('./useBudgetActions')
      const { fetchBudgets } = useBudgetActions()
      await fetchBudgets(financeId, year)
      await categoryApplication.fetchCategories()
      return { success: true }
    } catch (error) {
      console.error('Error loading initial data:', error)
      return { success: false }
    }
  }

  const MONTH_NAMES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ]

  const currency = computed(() => financesStore.defaultCurrency)
  const financeId = computed(() => financesStore.profile?.id ?? '')
  const budgetSelected = computed(() => budgetStore.budgetSelected)
  const budgetPlans = computed(() => budgetStore.budgetPlans)
  const currentMonthBudget = computed(() => {
    const now = new Date()
    const month = MONTH_NAMES[now.getMonth()]
    const year = now.getFullYear()
    return (
      budgetStore.budgetPlans.find(p => p.month.toLowerCase() === month && p.year === year) ?? null
    )
  })
  const budgetOptions = computed(() =>
    budgetStore.budgetPlans.map(item => ({
      label: replaceUnderscoresWithSpaces(item.name),
      value: item.id,
      selectable: true
    }))
  )

  const categoryOptions = computed(() =>
    categoryStore.categories.map(item => ({
      label: item.isSelectable ? item.name : item.name.toUpperCase(),
      value: item.id,
      disabled: !item.isSelectable
    }))
  )

  // Orchestration: create transaction
  const createTransaction = async (data: Record<string, unknown>) => {
    try {
      transactionStore.setLoading(true)
      const { success } = await transactionApi.createTransaction(data as unknown as TransactionData)

      if (!success) {
        transactionStore.setError({
          title: 'Error al crear transacción',
          message: 'No se pudo crear la transacción'
        })
      } else {
        const budgetId = String(data['budgetId'] ?? '') || transactionStore.budgetId
        if (budgetId) await fetchByBudget(budgetId)
      }

      return { success }
    } catch (err) {
      transactionStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      transactionStore.setLoading(false)
    }
  }

  // Orchestration: create income transaction + optional planned saving
  const createTransactionWithSavingsPlan = async (
    data: Record<string, unknown>,
    savingsPercentage: number
  ) => {
    try {
      transactionStore.setLoading(true)

      const { success } = await transactionApi.createTransaction(data as unknown as TransactionData)

      if (!success) {
        transactionStore.setError({
          title: 'Error al crear ingreso',
          message: 'No se pudo registrar el ingreso'
        })
        return { success: false }
      }

      const budgetId = String(data['budgetId'] ?? '')
      const amount = Number(data['amount'] ?? 0)
      const savingsAmount = Math.round(amount * (savingsPercentage / 100))

      if (budgetId && savingsAmount > 0) {
        await savingsApi.createPlannedSaving({ amount: savingsAmount, budgetId })
        await plannedSavingStore.fetchByBudget(budgetId)
      }

      if (transactionStore.budgetId) {
        await fetchByBudget(transactionStore.budgetId)
      }

      return { success: true }
    } catch (err) {
      transactionStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      transactionStore.setLoading(false)
    }
  }

  // Orchestration: update transaction
  const updateTransaction = async (id: string, data: Record<string, unknown>) => {
    try {
      transactionStore.setLoading(true)
      const { success } = await transactionApi.updateTransaction(
        id,
        data as unknown as Partial<TransactionData>
      )

      if (!success) {
        transactionStore.setError({
          title: 'Error al actualizar transacción',
          message: 'No se pudo actualizar la transacción'
        })
      } else {
        // Reload transactions for current budget
        if (transactionStore.budgetId) {
          await fetchByBudget(transactionStore.budgetId)
        }
      }

      return { success }
    } catch (err) {
      transactionStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      transactionStore.setLoading(false)
    }
  }

  // Orchestration: delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      transactionStore.setLoading(true)
      const { success } = await transactionApi.deleteTransaction(id)

      if (!success) {
        transactionStore.setError({
          title: 'Error al eliminar transacción',
          message: 'No se pudo eliminar la transacción'
        })
      } else {
        // Reload transactions for current budget
        if (transactionStore.budgetId) {
          await fetchByBudget(transactionStore.budgetId)
        }
      }

      return { success }
    } catch (err) {
      transactionStore.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      transactionStore.setLoading(false)
    }
  }

  return {
    transactions,
    pagination,
    totals,
    isLoading,
    currency,
    financeId,
    budgetSelected,
    budgetPlans,
    currentMonthBudget,
    budgetOptions,
    categoryOptions,
    fetchTransaction,
    fetchTotals,
    loadInitialData,
    setBudgetId,
    fetchByBudget,
    createTransaction,
    createTransactionWithSavingsPlan,
    updateTransaction,
    deleteTransaction
  }
}
