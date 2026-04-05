import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import type {
  TransactionFilters,
  TransactionPagination,
  TransactionState,
  TransactionSummary
} from '~/types/domain'

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    items: null,
    budgetId: '',
    filters: {
      type: undefined,
      categoryId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
      limit: 20
    },
    pagination: null,
    isLoading: false,
    error: null
  }),

  getters: {
    byType: state => (type: TransactionSummary['type']) =>
      state.items?.filter(item => item.type === type) ?? [],

    totalIncomeReceived(state): number {
      if (!state.items) return 0
      return state.items
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0)
    },

    totalExpensesPaid(state): number {
      if (!state.items) return 0
      return state.items
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0)
    },

    totalSavings(state): number {
      if (!state.items) return 0
      return state.items
        .filter(t => t.type === 'savings')
        .reduce((acc, t) => acc + Number(t.amount), 0)
    },

    hasActiveFilters(state): boolean {
      const f = state.filters
      return !!(f.type || f.categoryId || f.dateFrom || f.dateTo)
    }
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setItems(items: TransactionSummary[]) {
      this.items = items
      this.error = null
    },

    setBudgetId(budgetId: string) {
      this.budgetId = budgetId
    },

    setFilters(filters: Partial<TransactionFilters>) {
      this.filters = { ...this.filters, ...filters, page: 1 } // reset página al filtrar
    },

    clearFilters() {
      this.filters = { page: 1, limit: this.filters.limit }
    },

    setPage(page: number) {
      this.filters = { ...this.filters, page }
    },

    // Construye query string desde los filtros activos
    buildQueryParams(budgetId: string): string {
      const f = this.filters
      const params = new URLSearchParams()

      params.set('budgetId', budgetId)
      if (f.type) params.set('type', f.type)
      if (f.categoryId) params.set('categoryId', f.categoryId)
      if (f.dateFrom) params.set('dateFrom', f.dateFrom)
      if (f.dateTo) params.set('dateTo', f.dateTo)
      if (f.page) params.set('page', String(f.page))
      if (f.limit) params.set('limit', String(f.limit))

      return params.toString()
    },

    async fetchByBudget(budgetId: string, filters?: Partial<TransactionFilters>) {
      try {
        this.setLoading(true)

        if (budgetId) this.setBudgetId(budgetId)
        if (filters) this.setFilters(filters)

        // Usar el budgetId del parámetro con fallback al store
        const id = budgetId || this.budgetId

        if (!id) return { success: false, result: null }

        // Construir query string correctamente
        const query = this.buildQueryParams(id)

        const { success, result } = await $fetch<{
          success: boolean
          result: {
            transactions: TransactionSummary[]
            pagination: TransactionPagination
          }
        }>(`/api/transactions/by-budget/${id}?${query}`)

        if (success && result) {
          this.setItems(result.transactions)
          if (result.pagination) this.pagination = result.pagination
        }

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)
        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    // Recarga con los filtros actuales — útil para paginación
    async reload() {
      if (!this.budgetId) return
      return this.fetchByBudget(this.budgetId)
    },

    handleError(error: FetchError) {
      if (error.status === 401) {
        this.error = {
          status: error.status,
          title: 'Tu sesión ha expirado.',
          message: 'Por seguridad, tu sesión ha caducado. Por favor iniciá sesión nuevamente.'
        }
      } else {
        this.error = {
          title: '¡Ups! Algo no salió como esperábamos',
          message:
            'Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contactá soporte.'
        }
      }
    }
  }
})
