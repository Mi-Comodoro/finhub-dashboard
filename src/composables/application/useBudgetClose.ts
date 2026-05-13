import type { FetchError } from 'ofetch'
import { ref } from 'vue'

import { useBudgetApi } from '@/composables/api/useBudgetApi'
import { useFeedback } from '@/composables/useFeedback'

export type SurplusAction = 'transfer_to_goal' | 'carry_forward' | 'ignore'

export const useBudgetClose = () => {
  const budgetApi = useBudgetApi()
  const { error: errorToast } = useFeedback()

  const showSurplusModal = ref(false)
  const showDeficitModal = ref(false)
  const pendingClose = ref<string | null>(null)
  const surplus = ref(0)
  const isClosing = ref(false)

  const initiateClosure = async (
    budget: { id: string },
    libresincomprometer: number
  ) => {
    pendingClose.value = budget.id

    if (libresincomprometer > 0) {
      surplus.value = libresincomprometer
      showSurplusModal.value = true
      return
    }

    if (libresincomprometer < 0) {
      surplus.value = libresincomprometer
      showDeficitModal.value = true
      return
    }

    // surplus === 0: cerrar directo, retornar true para que la página recargue
    await executeClosure(budget.id, 'ignore')
  }

  // Retorna true si el cierre fue exitoso (para que la página pueda recargar)
  const executeClosure = async (
    budgetId: string,
    surplusAction: SurplusAction,
    targetGoalId?: string
  ): Promise<boolean> => {
    if (!budgetId) return false

    isClosing.value = true
    try {
      await budgetApi.closeBudget(budgetId, { surplusAction, targetGoalId })
      showSurplusModal.value = false
      showDeficitModal.value = false
      pendingClose.value = null
      surplus.value = 0
      return true
    } catch (err) {
      const status = (err as FetchError)?.status
      if (status !== 401) {
        errorToast('Error al cerrar', 'No se pudo cerrar el presupuesto. Intenta nuevamente.')
      }
      return false
    } finally {
      isClosing.value = false
    }
  }

  const cancelClosure = () => {
    showSurplusModal.value = false
    showDeficitModal.value = false
    pendingClose.value = null
    surplus.value = 0
  }

  return {
    showSurplusModal,
    showDeficitModal,
    surplus,
    pendingClose,
    isClosing,
    initiateClosure,
    executeClosure,
    cancelClosure
  }
}
