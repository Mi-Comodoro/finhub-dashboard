import type { FetchError } from 'ofetch'
import { defineStore } from 'pinia'

import type { GoalsData, GoalsResponseList } from '@/types/api/'

export const useGoalsStore = defineStore('goals', {
  state: (): {
    goals: GoalsData[]
    error: { title: string; message: string; status?: number } | null
    isLoading: boolean
  } => ({
    goals: [],
    error: null,
    isLoading: false
  }),
  actions: {
    async fetchGoals() {
      this.isLoading = true
      this.error = null
      try {
        const { result } = await $fetch<GoalsResponseList>('/api/goals/find', {
          method: 'GET'
        })
        this.goals = result
      } catch (err) {
        this.handleError(err as FetchError)
      } finally {
        this.isLoading = false
      }
    },
    async addSavingGoals(data: {
      name: string
      reason: string
      targetAmount: number
      targetDate: Date
      isActive: boolean
      accountId: string
    }) {
      this.error = null
      try {
        const { success } = await $fetch('/api/goals/create', {
          method: 'POST',
          body: data
        })
        await this.fetchGoals()
        return success
      } catch (err) {
        this.handleError(err as FetchError)
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
            ' Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
        }
      }
    }
  }
})
