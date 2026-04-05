import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { percentOf } from '@/utils/currency'
import type { PlannedIncomeState, PlannedIncomeSummary, PlannedSavingSummary } from '~/types/domain'

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
    buckets(state) {
      const budgetStore = useBudgetStore()
      const financesStore = useFinancesStore()

      const limits = budgetStore.currentBudgetPlan?.limits
      const expected = state.expectedIncome

      return {
        needsAmount: percentOf(expected, limits?.needs ?? 0, financesStore.defaultCurrency),
        wantsAmount: percentOf(expected, limits?.wants ?? 0, financesStore.defaultCurrency),
        savingsAmount: percentOf(expected, limits?.savings ?? 0, financesStore.defaultCurrency)
      }
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

    setProcessingIncomeId(incomeId: string | null) {
      this.processingIncomeId = incomeId
    },

    getExpectedAmount(result: PlannedIncomeSummary[]) {
      return result.reduce((acc, b) => acc + Number(b.amount), 0)
    },

    updatePlannedIncomeSummary(plannedIncome: PlannedIncomeSummary) {
      if (!this.summary) return

      this.summary = this.summary.map(item => {
        if (item.id === plannedIncome.id) {
          return {
            ...item,
            ...plannedIncome
          }
        }
        return item
      })
    },

    async fetchPlannedIncomeByBudgetId(budgetId: string) {
      try {
        this.setLoading(true)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedIncomeSummary[]
        }>(`/api/incomes/planned/by-budget/${budgetId}`)

        if (success && result) {
          // ✅ primero setear data
          this.setSummary(result)
          this.setBudgetId(budgetId)

          // ✅ luego calcular
          const expectedIncome = this.getExpectedAmount(result)
          this.expectedIncome = expectedIncome
        }

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    async fetchPlannedIncome() {
      try {
        this.setLoading(true)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedIncomeSummary[]
        }>(`/api/incomes/planned/`)

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    async markAsReceived(id: string) {
      try {
        this.error = null
        this.setProcessingIncomeId(id)

        const { success, result } = await $fetch<{
          success: boolean
          result: {
            plannedIncome: PlannedIncomeSummary | null
            plannedSavings: PlannedSavingSummary[]
          } | null
        }>(`/api/incomes/planned/${id}`, {
          method: 'PATCH'
        })

        if (success && result?.plannedIncome) {
          // ✅ actualizar item (reactivo)
          this.updatePlannedIncomeSummary(result.plannedIncome)

          // ✅ recalcular ingreso total
          if (this.summary) {
            const expectedIncome = this.getExpectedAmount(this.summary)
            this.expectedIncome = expectedIncome
          }
        }

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)

        return {
          success: false,
          result: null as {
            plannedIncome: PlannedIncomeSummary
            plannedSavings: PlannedSavingSummary[]
          } | null
        }
      } finally {
        this.setProcessingIncomeId(null)
      }
    },

    clearIncomeData() {
      this.summary = null
      this.processingIncomeId = null
      this.error = null
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
            'Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
        }
      }
    }
  }
})
