import { defineStore } from 'pinia'

import type { TravelExpense } from '@/types/travel-expense.types'

export const useTravelExpenseStore = defineStore('travel-expenses', {
  state: (): {
    expenses: TravelExpense[]
    selectedExpense: TravelExpense | null
    isLoading: boolean
    error: { title: string; message: string } | null
  } => ({
    expenses: [],
    selectedExpense: null,
    isLoading: false,
    error: null
  }),
  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setExpenses(expenses: TravelExpense[]) {
      this.expenses = expenses
      this.error = null
    },
    setSelectedExpense(expense: TravelExpense | null) {
      this.selectedExpense = expense
    },
    setError(error: { title: string; message: string } | null) {
      this.error = error
    }
  }
})
