/**
 * Income Store
 * Manages income state using domain models
 * Follows strict architectural rules - no API types, only domain models
 */

import { defineStore } from 'pinia'

import type { PlannedIncomeState, PlannedIncomeSummary } from '~/types/domain'

export const usePlannedIncomeStore = defineStore('plannedIncome', {
  state: (): PlannedIncomeState => ({
    summary: null,
    budgetId: '',
    isLoading: false,
    error: null,
    expectedIncome: 0,
    needsAmount: 0,
    savingsAmount: 0,
    wantsAmount: 0
  }),

  getters: {
    buckets(): { needsAmount: number; wantsAmount: number; savingsAmount: number } {
      return {
        needsAmount: this.needsAmount,
        wantsAmount: this.wantsAmount,
        savingsAmount: this.savingsAmount
      }
    }
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setExpectedIncome(totalIncome: number) {
      this.expectedIncome = totalIncome
    },
    setBucket(bucket: { needs: number; wants: number; savings: number }) {
      this.savingsAmount = bucket.savings
      this.needsAmount = bucket.needs
      this.wantsAmount = bucket.wants
    },

    setError(error: string | null) {
      this.error = error
    },

    setSummary(summary: PlannedIncomeSummary[]) {
      this.summary = summary
      this.error = null
    },

    setBudgetId(budgetId: string) {
      this.budgetId = budgetId
    },
    clearIncomeData() {
      this.summary = null
      this.error = null
    }
  }
})
