import type { FetchError } from 'ofetch'

import { useBudgetApi } from '@/composables/api/useBudgetApi'
import { useBudgetActions } from '@/composables/application/useBudgetActions'
import { useFeedback } from '@/composables/useFeedback'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'

interface TransferBalanceDto {
  targetBudgetId?: string
  goalId?: string
  amount: number
}

export const useBudgetTransferApplication = () => {
  const budgetApi = useBudgetApi()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const { fetchCurrentBudget } = useBudgetActions()
  const { error: errorToast } = useFeedback()

  const transferBalance = async (id: string, dto: TransferBalanceDto) => {
    try {
      await budgetApi.transferBalance(id, dto)
      return { success: true }
    } catch (err) {
      const status = (err as FetchError)?.status
      if (status !== 401) {
        errorToast('Error al transferir', 'No se pudo transferir el saldo. Intenta nuevamente.')
      }
      return { success: false }
    }
  }

  const transferToBudget = async (closedBudgetId: string, amount: number) => {
    const financeId = financesStore.financeId
    if (!budgetStore.currentBudgetPlan) {
      await fetchCurrentBudget(financeId)
    }
    const targetBudgetId = budgetStore.currentBudgetPlan?.id
    if (!targetBudgetId) {
      errorToast(
        'Sin presupuesto activo',
        'No hay un presupuesto activo al cual transferir el saldo.'
      )
      return { success: false }
    }
    return transferBalance(closedBudgetId, { targetBudgetId, amount })
  }

  const transferToGoal = async (closedBudgetId: string, goalId: string, amount: number) => {
    return transferBalance(closedBudgetId, { goalId, amount })
  }

  return { transferToBudget, transferToGoal }
}
