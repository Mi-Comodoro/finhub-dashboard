import { computed } from 'vue'

import { usePlansApi } from '~/composables/api/usePlansApi'
import { usePlansStore } from '~/stores/plans.store'

export const usePlansApplication = () => {
  const plansStore = usePlansStore()
  const plansApi = usePlansApi()

  const fetchPlans = async () => {
    try {
      plansStore.setLoading(true)
      plansStore.setError(null)
      const { success, result } = await plansApi.getAdminPlans()

      if (!success) {
        plansStore.setError('Error al obtener planes')
        return { success: false }
      }

      plansStore.setPlans(result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener planes'
      plansStore.setError(errorMessage)
      return { success: false }
    } finally {
      plansStore.setLoading(false)
    }
  }

  const createPlan = async (data: Record<string, unknown>) => {
    try {
      plansStore.setLoading(true)
      plansStore.setError(null)
      const { success, result } = await plansApi.createPlan(data)

      if (!success || !result) {
        plansStore.setError('Error al crear plan')
        return { success: false }
      }

      plansStore.addPlan(result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear plan'
      plansStore.setError(errorMessage)
      return { success: false }
    } finally {
      plansStore.setLoading(false)
    }
  }

  const updatePlan = async (id: string, data: Record<string, unknown>) => {
    try {
      plansStore.setLoading(true)
      plansStore.setError(null)
      const { success, result } = await plansApi.updatePlan(id, data)

      if (!success || !result) {
        plansStore.setError('Error al actualizar plan')
        return { success: false }
      }

      plansStore.updatePlanData(id, result)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar plan'
      plansStore.setError(errorMessage)
      return { success: false }
    } finally {
      plansStore.setLoading(false)
    }
  }

  const deletePlan = async (id: string) => {
    try {
      plansStore.setLoading(true)
      plansStore.setError(null)
      const { success } = await plansApi.deletePlan(id)

      if (!success) {
        plansStore.setError('Error al eliminar plan')
        return { success: false }
      }

      plansStore.removePlan(id)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar plan'
      plansStore.setError(errorMessage)
      return { success: false }
    } finally {
      plansStore.setLoading(false)
    }
  }

  const plans = computed(() => plansStore.plans)
  const isLoading = computed(() => plansStore.isLoading)
  const error = computed(() => plansStore.error)

  return {
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    plans,
    isLoading,
    error
  }
}
