import { defineStore } from 'pinia'

import type { TransactionFilters, TransactionState, TransactionSummary } from '~/types/domain'

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
        .reduce((acc, t) => acc + (t.amount ?? 0), 0)
    },

    totalExpensesPaid(state): number {
      if (!state.items) return 0
      return state.items
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + (t.amount ?? 0), 0)
    },

    totalSavings(state): number {
      if (!state.items) return 0
      return state.items
        .filter(t => t.type === 'savings')
        .reduce((acc, t) => acc + (t.amount ?? 0), 0)
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

    setPagination(pagination: TransactionState['pagination']) {
      this.pagination = pagination
    },

    setError(error: TransactionState['error']) {
      this.error = error
    }
  }
})
