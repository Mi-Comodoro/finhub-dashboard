import { defineStore } from 'pinia'

import type { GoalsData } from '@/types/api/'

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
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setGoals(goals: GoalsData[]) {
      this.goals = goals
      this.error = null
    },

    setError(error: { title: string; message: string; status?: number } | null) {
      this.error = error
    }
  }
})
