import type { FetchError } from 'ofetch'

import { useTransactionApi } from '@/composables/api/useTransactionApi'
import { useCategoryApplication } from '@/composables/application/useCategoryApplication'
import { useBudgetStore } from '@/stores/budget.store'
import { useCategoryStore } from '@/stores/categories.store'
import { useFinancesStore } from '@/stores/finances.store'
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
  const categoryApplication = useCategoryApplication()
  const transactionApi = useTransactionApi()
  const { currentBudget } = useCommon()

  const transactions = computed(() => transactionStore.items)
  const pagination = computed(() => transactionStore.pagination)
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

  const fetchTransaction = async (budgetId: string, filters: TransactionFilters) => {
    if (currentBudget.value) await fetchByBudget(budgetId, filters)
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

  const currency = computed(() => financesStore.defaultCurrency)
  const financeId = computed(() => financesStore.profile?.id ?? '')
  const budgetSelected = computed(() => budgetStore.budgetSelected)
  const budgetPlans = computed(() => budgetStore.budgetPlans)
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

  return {
    transactions,
    pagination,
    isLoading,
    currency,
    financeId,
    budgetSelected,
    budgetPlans,
    budgetOptions,
    categoryOptions,
    fetchTransaction,
    loadInitialData,
    setBudgetId,
    fetchByBudget
  }
}
