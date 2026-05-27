import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import { useSavingsApi } from '@/composables/api/useSavingsApi'
import type { SavingAllocationData } from '@/types/api/'

export const useSavingAllocationsStore = defineStore('allocations', {
  state: (): {
    savingAllocations: SavingAllocationData[]
    error: { title: string; message: string; status?: number } | null
    isLoading: boolean
    newSavingAmount: number
  } => ({
    savingAllocations: [],
    error: null,
    isLoading: false,
    newSavingAmount: 0
  }),
  getters: {
    getAvailableAmount: state => state.newSavingAmount
  },
  actions: {
    async fetchSavingAllocations(budgetId: string) {
      const { getAllocationsByBudget } = useSavingsApi()
      this.isLoading = true
      this.error = null

      try {
        const { result } = await getAllocationsByBudget(budgetId)
        this.savingAllocations = result
      } catch (err) {
        this.handleError(err as FetchError)
      } finally {
        this.isLoading = false
      }
    },
    async addSavingAllocation(data: { percentage: number; goalId: string; budgetId: string }) {
      const { createAllocation } = useSavingsApi()
      this.error = null
      try {
        const { success } = await createAllocation(data)
        await this.fetchSavingAllocations(data.budgetId)
        return success
      } catch (err) {
        this.handleError(err as FetchError)
      }
    },
    async replaceAllocations(
      budgetId: string,
      distributions: Array<{ goalId: string; percentage: number }>
    ) {
      const { replaceAllocations } = useSavingsApi()
      this.error = null
      try {
        const { result } = await replaceAllocations(budgetId, distributions)
        this.savingAllocations = result
        return { success: true }
      } catch (err) {
        this.handleError(err as FetchError)
        return { success: false }
      }
    },
    setNewSavingAmount(amount: number) {
      this.newSavingAmount = amount
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
    }
  }
})
