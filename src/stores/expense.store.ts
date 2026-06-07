// stores/useExpensesStore.ts

import { defineStore } from 'pinia'

type ExpenseStatus = 'PLANNED' | 'PAID' | 'CANCELED' | 'SKIPPED'

interface ExpenseState {
  expenses: Array<{
    id: string
    budgetId: string
    category: string
    bucket: string
    name: string
    expectedAmount: number
    dueDate: Date | string
    status: ExpenseStatus
    isEssential: boolean
    notes?: string
    billsId?: string | null
    customBucketId?: string | null
    createdAt: Date | string
    updatedAt: Date | string
  }>
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  filters: {
    budgetId: string
    search: string
    status: string
    bucket: string
    page: number
    limit: number
  }
  loading: boolean
  error: string
}

export const useExpensesStore = defineStore('expenses', {
  state: (): ExpenseState => ({
    expenses: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    },
    filters: {
      budgetId: '',
      search: '',
      status: '',
      bucket: '',
      page: 1,
      limit: 10
    },
    loading: false,
    error: ''
  }),

  getters: {
    totalPaid: state =>
      state.expenses
        .filter(e => e.status === 'PAID')
        .reduce((sum, e) => sum + Number(e.expectedAmount ?? 0), 0),

    totalPlanned: state =>
      state.expenses
        .filter(e => e.status === 'PLANNED')
        .reduce((sum, e) => sum + Number(e.expectedAmount ?? 0), 0),

    // PAID + PLANNED: all active commitments for LIBRE SIN COMPROMETER
    totalCommitted: state =>
      state.expenses
        .filter(e => e.status === 'PAID' || e.status === 'PLANNED')
        .reduce((sum, e) => sum + Number(e.expectedAmount ?? 0), 0)
  },

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string) {
      this.error = error
    },

    setExpenses(expenses: ExpenseState['expenses']) {
      this.expenses = expenses
    },

    setMeta(meta: ExpenseState['meta']) {
      this.meta = meta
    },

    updateExpenseStatus(id: string, status: ExpenseStatus) {
      const index = this.expenses.findIndex(e => e.id === id)
      if (index !== -1) {
        this.expenses[index]!.status = status
      }
    },

    setSearch(value: string) {
      this.filters.search = value
      this.filters.page = 1
    },

    setStatus(value: string) {
      this.filters.status = value
      this.filters.page = 1
    },

    setBucket(value: string) {
      this.filters.bucket = value
      this.filters.page = 1
    },

    setPage(page: number) {
      this.filters.page = page
    },

    setBudget(budgetId: string) {
      this.filters.budgetId = budgetId
    }
  }
})
