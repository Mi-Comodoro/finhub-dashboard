/**
 * Income Store
 * Manages income state using domain models
 * Follows strict architectural rules - no API types, only domain models
 */

import { defineStore } from 'pinia'

import type { Income, IncomeState, IncomeSummary } from '~/types/domain'

export const useIncomeStore = defineStore('income', {
  state: (): IncomeState => ({
    incomes: [],
    expectedIncomes: [],
    summary: null,
    isLoading: false,
    error: null
  }),

  getters: {},

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setIncomes(incomes: readonly Income[]) {
      this.incomes = [...incomes]
      this.error = null
    },

    addIncome(income: Income) {
      this.incomes.push(income)
      this.error = null
    },

    updateIncome(updatedIncome: Income) {
      const index = this.incomes.findIndex(income => income.id === updatedIncome.id)

      if (index !== -1) {
        this.incomes[index] = updatedIncome
        this.error = null
      }
    },

    removeIncome(incomeId: string) {
      this.incomes = this.incomes.filter(income => income.id !== incomeId)
      this.error = null
    },

    setSummary(summary: IncomeSummary | null) {
      this.summary = summary
      this.error = null
    },

    clearIncomeData() {
      this.incomes = []
      this.expectedIncomes = []
      this.summary = null
      this.error = null
    }
  }
})
