import { defineStore } from 'pinia'

import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { percentOf } from '@/utils/currency'
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

    getExpectedAmount(result: PlannedIncomeSummary[]) {
      return result.reduce((acc, b) => acc + Number(b.amount), 0)
    },

    calculateBuckets(expectedIncome: number) {
      const budgetStore = useBudgetStore()
      const financesStore = useFinancesStore()

      const limits = budgetStore.currentBudgetPlan?.limits

      this.needsAmount = percentOf(
        expectedIncome,
        limits?.needs ?? 0,
        financesStore.defaultCurrency
      )

      this.wantsAmount = percentOf(
        expectedIncome,
        limits?.wants ?? 0,
        financesStore.defaultCurrency
      )

      this.savingsAmount = percentOf(
        expectedIncome,
        limits?.savings ?? 0,
        financesStore.defaultCurrency
      )
    },

    async fetchPlannedIncomeByBudgetId(budgetId: string) {
      try {
        this.setLoading(true)
        this.setError(null)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedIncomeSummary[]
        }>(`/api/incomes/planned/${budgetId}`)

        if (success && result) {
          const expectedIncome = this.getExpectedAmount(result)

          this.expectedIncome = expectedIncome
          this.calculateBuckets(expectedIncome)

          this.setSummary(result)
          this.setBudgetId(budgetId)
        }

        return { success, result }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching incomes'

        this.setError(errorMessage)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    async fetchPlannedIncome() {
      try {
        this.setLoading(true)
        this.setError(null)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedIncomeSummary[]
        }>(`/api/incomes/planned/`)

        return { success, result }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching incomes'

        this.setError(errorMessage)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    clearIncomeData() {
      this.summary = null
      this.error = null
    }
  }
})
