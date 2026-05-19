import type { PlanData } from '~/types/api'

export const usePlansStore = defineStore('plans', {
  state: () => ({
    plans: [] as PlanData[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {},

  actions: {
    setPlans(plans: PlanData[]) {
      this.plans = plans
    },

    addPlan(plan: PlanData) {
      this.plans.push(plan)
    },

    updatePlanData(id: string, data: Partial<PlanData>) {
      const i = this.plans.findIndex(p => p.id === id)
      if (i !== -1) this.plans[i] = { ...this.plans[i], ...data }
    },

    removePlan(id: string) {
      this.plans = this.plans.filter(p => p.id !== id)
    },

    setLoading(v: boolean) {
      this.isLoading = v
    },

    setError(e: string | null) {
      this.error = e
    }
  }
})
