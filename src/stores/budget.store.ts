/**
 * Budget Store
 * Manages budget state using domain models
 * Follows strict architectural rules - no API types, only domain models
 */

import { defineStore } from 'pinia'

import type {
  Budget,
  BudgetPeriod,
  BudgetState,
  BudgetSummary,
  Category,
  CurrentBudgetPlan
} from '~/types/domain'

export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    budgetPlans: [],
    categories: [],
    activeBudget: null,
    currentBudgetPlan: null,
    summary: null,
    isLoading: false,
    error: null
  }),

  getters: {
    currentBudget: (state): Budget | null => {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      return (
        state.budgets.find(
          budget => budget.period.year === currentYear && budget.period.month === currentMonth
        ) ?? null
      )
    },

    nextBudget: (state): Budget | null => {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear

      return (
        state.budgets.find(
          budget => budget.period.year === nextYear && budget.period.month === nextMonth
        ) ?? null
      )
    },

    editableBudgets: (state): readonly Budget[] => {
      return state.budgets.filter(budget => budget.isEditable)
    },

    categoriesByType: state => {
      return (type: 'need' | 'want' | 'saving') =>
        state.categories.filter(category => category.type === type)
    },

    getCategoryById: state => {
      return (categoryId: string) =>
        state.categories.find(category => category.id === categoryId) ?? null
    },

    getBudgetByPeriod: state => {
      return (period: BudgetPeriod) =>
        state.budgets.find(
          budget => budget.period.year === period.year && budget.period.month === period.month
        ) ?? null
    },

    totalOverBudgetAmount: (state): number => {
      if (!state.activeBudget) return 0

      return state.activeBudget.allocations
        .filter(allocation => allocation.isOverBudget)
        .reduce((total, allocation) => total + Math.abs(allocation.remainingAmount), 0)
    }

    /*  savingsPercentage: (state): number => {
      if (!state.activeBudget || state.activeBudget.totalIncome === 0) return 0

      const savingsAmount = state.activeBudget.totalIncome - state.activeBudget.totalActual
      return (savingsAmount / state.activeBudget.totalIncome) * 100
    } */
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setBudgets(budgets: readonly Budget[]) {
      this.budgets = [...budgets]
      this.error = null
    },

    addBudget(budget: Budget) {
      // Remove existing budget for the same period
      this.budgets = this.budgets.filter(
        b => !(b.period.year === budget.period.year && b.period.month === budget.period.month)
      )

      this.budgets.push(budget)
      this.error = null
    },

    updateBudget(updatedBudget: Budget) {
      const index = this.budgets.findIndex(b => b.id === updatedBudget.id)

      if (index !== -1) {
        this.budgets[index] = updatedBudget

        // Update active budget if it's the same
        if (this.activeBudget?.id === updatedBudget.id) {
          this.activeBudget = updatedBudget
        }

        this.error = null
      }
    },

    removeBudget(budgetId: string) {
      this.budgets = this.budgets.filter(b => b.id !== budgetId)

      // Clear active budget if removed
      if (this.activeBudget?.id === budgetId) {
        this.activeBudget = null
      }

      this.error = null
    },

    setCategories(categories: readonly Category[]) {
      this.categories = [...categories]
      this.error = null
    },

    setActiveBudget(budget: Budget | null) {
      this.activeBudget = budget
    },

    setSummary(summary: BudgetSummary | null) {
      this.summary = summary
      this.error = null
    },

    setCurrentBudget(plan: CurrentBudgetPlan) {
      this.currentBudgetPlan = plan
      this.error = null
    },

    setBudgetPlans(plans: CurrentBudgetPlan[]) {
      this.budgetPlans = plans
      this.error = null
    },

    clearBudgetData() {
      this.budgets = []
      this.budgetPlans = []
      this.categories = []
      this.activeBudget = null
      this.currentBudgetPlan = null
      this.summary = null
      this.error = null
    },

    // Helper method to update specific allocation
    updateAllocation(budgetId: string, categoryId: string, plannedAmount: number) {
      const budget = this.budgets.find(b => b.id === budgetId)

      if (!budget) return

      const updatedAllocations = budget.allocations.map(allocation => {
        if (allocation.categoryId === categoryId) {
          const remainingAmount = plannedAmount - allocation.actualAmount
          return {
            ...allocation,
            plannedAmount,
            remainingAmount,
            isOverBudget: remainingAmount < 0
          }
        }
        return allocation
      })

      const updatedBudget: Budget = {
        ...budget,
        allocations: updatedAllocations,
        /*  totalPlanned: updatedAllocations.reduce((sum, a) => sum + a.plannedAmount, 0), */
        updatedAt: new Date()
      }

      this.updateBudget(updatedBudget)
    }
  }
})
