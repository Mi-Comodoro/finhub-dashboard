import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import type { SavingAllocationData, SavingAllocationResponseList } from '@/types/api/'

import { useBudgetStore } from './budget.store'

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
    async fetchSavingAllocations() {
      this.isLoading = true
      this.error = null
      const budgetStore = useBudgetStore()

      try {
        const { result } = await $fetch<SavingAllocationResponseList>(
          `/api/savings/allocations/${budgetStore.currentBudgetPlan?.id}`,
          {
            method: 'GET'
          }
        )
        console.log(result)
        this.savingAllocations = result
      } catch (err) {
        this.handleError(err as FetchError)
      } finally {
        this.isLoading = false
      }
    },
    async addSavingAllocation(data: { percentage: number; goalId: string; budgetId: string }) {
      this.error = null
      try {
        const { success } = await $fetch('/api/savings/allocations/create', {
          method: 'POST',
          body: data
        })
        await this.fetchSavingAllocations()
        return success
      } catch (err) {
        this.handleError(err as FetchError)
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
