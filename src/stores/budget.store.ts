/**
 * Budget Store
 * Manages budget state using domain models
 * Follows strict architectural rules - no API types, only domain models
 */

import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import type { BudgetListResponse, CurrentBudget, SingleBudget } from '~/types/api'
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
    budgetSelected: null,
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
  },

  actions: {
    async fetchCurrentBudget(financeId: string, month?: number, year?: number) {
      try {
        if (!financeId) return

        this.setLoading(true)
        this.setError(null)
        const { success, result } = await $fetch<CurrentBudget>(`/api/budgets/current/${financeId}`, {
          query: {
            ...(month !== undefined ? { month } : {}),
            ...(year !== undefined ? { year } : {})
          }
        })

        if (!success || !result) return

        this.setCurrentBudget({
          id: result.id,
          name: result.name,
          month: result.month,
          year: result.year,
          isShared: result.isShared,
          limits: result.limits,
          financesId: result.financesId,
          status: result.status,
          ownerId: result.ownerId,
          partnerId: result.partnerId,
          strategy: result.strategy,
          frequency: result.frequency
        })
      } catch (err) {
        if ((err as FetchError).status === 404) {
          this.setCurrentBudget(null)
          this.setError(null)
          return
        }
        console.error('❌ Error fetching current budget:', err)
        this.handleError(err as FetchError)
      } finally {
        this.setLoading(false)
      }
    },
    async fetchBudgets(financeId: string, year?: number) {
      if (!financeId) return

      this.setLoading(true)
      this.setError(null)

      try {
        const { success, result } = await $fetch<BudgetListResponse>(
          `/api/budgets/finances/${financeId}`,
          {
            query: year !== undefined ? { year } : {}
          }
        )

        if (!success || !result) return

        this.setBudgetPlans(
          result.map(item => ({
            id: item.id,
            name: item.name,
            month: item.month,
            year: item.year,
            isShared: item.isShared,
            status: item.status,
            limits: item.limits,
            ownerId: item.ownerId,
            financesId: item.financesId,
            partnerId: item.partnerId,
            strategy: item.strategy,
            frequency: item.frequency
          }))
        )
      } catch (err) {
        console.error('❌ Error fetching budgets:', err)
        this.handleError(err as FetchError)
      } finally {
        this.setLoading(false)
      }
    },

    async fetchBudgetById(budgetId: string) {
      this.setLoading(true)
      this.setError(null)

      try {
        const { success, result } = await $fetch<CurrentBudget>(`/api/budgets/plan/${budgetId}`)

        if (!success || !result) return

        this.setBudgetSelected({
          id: result.id,
          name: result.name,
          month: result.month,
          year: result.year,
          isShared: result.isShared,
          limits: result.limits,
          financesId: result.financesId,
          status: result.status,
          ownerId: result.ownerId,
          partnerId: result.partnerId,
          strategy: result.strategy,
          frequency: result.frequency
        })
      } catch (err) {
        console.error('❌ Error fetching current budget:', err)
        this.handleError(err as FetchError)
      } finally {
        this.setLoading(false)
      }
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: { title: string; message: string; status?: number } | null) {
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

    setCurrentBudget(plan: CurrentBudgetPlan | null) {
      this.currentBudgetPlan = plan
      this.error = null
    },
    setBudgetSelected(plan: CurrentBudgetPlan) {
      this.budgetSelected = plan
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

    async enableBudget(budgetId: string) {
      this.setLoading(true)
      this.setError(null)

      try {
        const { success, result } = await $fetch<CurrentBudget>(`/api/budgets/enable/${budgetId}`)
        if (!success || !result) return

        // Actualiza el plan actual
        this.setCurrentBudget(result)
        const mappedBudget = this.mapSingleBudgetToBudget(result)
        // Actualiza la lista de presupuestos
        this.updateBudget(mappedBudget)

        // Si es el presupuesto activo, también lo actualizamos
        if (this.activeBudget?.id === budgetId) {
          this.setActiveBudget(mappedBudget)
        }
      } catch (err) {
        console.error('❌ Error enabling budget:', err)
        this.handleError(err as FetchError)
      } finally {
        this.setLoading(false)
      }
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
    },

    handleError(error: FetchError) {
      if (error.status === 401) {
        this.error = {
          status: error.status,
          title: 'Tu sesión ha expirado.',
          message:
            'Por seguridad, tu sesión ha caducado debido a la inactividad. Por favor, inicia sesión nuevamente para continuar.'
        }
      } else {
        this.error = {
          title: '¡Ups! Algo no salió como esperábamos',
          message:
            ' Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
        }
      }
    },

    mapSingleBudgetToBudget(single: SingleBudget): Budget {
      return {
        id: single.id,
        userId: single.ownerId ?? '', // por si es null en el backend
        period: {
          month: Number(single.month),
          year: Number(single.year)
        },
        frequency: single.frequency,
        status: single.status,
        allocations: [], // inicial vacío, o si el backend devuelve allocations, mapéalos aquí
        strategy: single.strategy,
        isEditable: true, // define tu lógica según reglas de negocio
        createdAt: new Date(), // o si el backend devuelve fecha, úsala
        updatedAt: new Date()
      }
    }
  }
})
