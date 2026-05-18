import { defineStore } from 'pinia'

import type { PlannedIncomeState, PlannedIncomeSummary } from '~/types/domain'

export const usePlannedIncomeStore = defineStore('plannedIncome', {
  state: (): PlannedIncomeState => ({
    summary: null,
    budgetId: '',
    isLoading: false,
    processingIncomeId: null,
    error: null,
    expectedIncome: 0
  }),

  getters: {
    totalGenerated(state) {
      if (!state.summary) return 0
      return state.summary
        .filter(income => income.status === 'RECEIVED')
        .reduce((sum, income) => sum + Number(income.amount ?? 0), 0)
    }
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setSummary(summary: PlannedIncomeSummary[]) {
      this.summary = summary
      this.error = null
    },

    setBudgetId(budgetId: string) {
      this.budgetId = budgetId
    },

    setExpectedIncome(amount: number) {
      this.expectedIncome = amount
    },

    setProcessingIncomeId(incomeId: string | null) {
      this.processingIncomeId = incomeId
    },

    setError(error: PlannedIncomeState['error']) {
      this.error = error
    },

    clearIncomeData() {
      this.summary = null
      this.processingIncomeId = null
      this.error = null
    }
  }
})
