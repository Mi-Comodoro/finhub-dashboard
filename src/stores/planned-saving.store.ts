import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import type { PlannedSavingState, PlannedSavingSummary } from '~/types/domain'

export const usePlannedSavingStore = defineStore('plannedSaving', {
  state: (): PlannedSavingState => ({
    items: null,
    budgetId: '',
    isLoading: false,
    error: null
  }),

  getters: {
    pendingItems: state => state.items?.filter(item => item.status === 'pending') ?? [],
    completedItems: state => state.items?.filter(item => item.status === 'completed') ?? [],
    totalSavingGenerated(state): number {
      if (!state.items) return 0
      return state.items.reduce((acc, i) => acc + Number(i.amount), 0)
    },

    totalSavingPending(state): number {
      if (!state.items) return 0
      return state.items
        .filter(i => i.status === 'pending')
        .reduce((acc, i) => acc + Number(i.amount), 0)
    }
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setItems(items: PlannedSavingSummary[]) {
      this.items = items
      this.error = null
    },

    setBudgetId(budgetId: string) {
      this.budgetId = budgetId
    },

    async fetchByBudget(budgetId: string) {
      try {
        this.setLoading(true)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedSavingSummary[]
        }>(`/api/savings/planned/by-budget/${budgetId}`)

        if (success && result) {
          this.setItems(result)
          this.setBudgetId(budgetId)
        }

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
    },

    async markAsCompleted(itemId: string) {
      const transactionStore = useTransactionStore()
      try {
        this.setLoading(true)

        const { success, result } = await $fetch<{
          success: boolean
          result: PlannedSavingSummary
        }>(`/api/savings/planned/${itemId}`, {
          method: 'PATCH'
        })

        if (success && result) {
          await this.fetchByBudget(this.budgetId)
          await transactionStore.fetchByBudget(this.budgetId)
        }

        return { success, result }
      } catch (err) {
        this.handleError(err as FetchError)

        return { success: false, result: null }
      } finally {
        this.setLoading(false)
      }
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
