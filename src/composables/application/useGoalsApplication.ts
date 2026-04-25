import type { FetchError } from 'ofetch'

import { useSavingsApi } from '@/composables/api/useSavingsApi'
import { useAccountStore } from '@/stores/account.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useGoalsStore } from '@/stores/goals.store'
import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
import type { GoalsData } from '~/types/api'

import { usePlannedIncomeApplication } from './usePlannedIncomeApplication'

// Business logic: manejo de errores
const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message:
        'Por seguridad, tu sesión ha caducado debido a la inactividad. Por favor, inicia sesión nuevamente para continuar.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message:
      ' Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
  }
}

export const useGoalsApplication = () => {
  const accountStore = useAccountStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const goalsStore = useGoalsStore()
  const { fetchPlannedIncomeByBudgetId } = usePlannedIncomeApplication()
  const savingsAllocationsStore = useSavingAllocationsStore()
  const savingsApi = useSavingsApi()

  // Orchestration: fetch goals
  const fetchGoals = async () => {
    goalsStore.setLoading(true)
    goalsStore.setError(null)
    try {
      const { result } = await savingsApi.getGoals()
      goalsStore.setGoals(result)
    } catch (err) {
      goalsStore.setError(createErrorMessage(err as FetchError))
    } finally {
      goalsStore.setLoading(false)
    }
  }

  // Orchestration: add saving goal
  const addSavingGoal = async (data: GoalsData) => {
    goalsStore.setError(null)
    try {
      const { success } = await savingsApi.createGoal(data)
      await fetchGoals()
      return success
    } catch (err) {
      goalsStore.setError(createErrorMessage(err as FetchError))
      return false
    }
  }

  const loadGoalsData = async () => {
    try {
      if (accountStore.accounts.length < 1) {
        await accountStore.fetchAccounts()
      }

      await fetchGoals()

      return { success: !goalsStore.error }
    } catch (error) {
      console.error('Error loading goals data:', error)
      return { success: false }
    }
  }

  const loadSavingAllocations = async (budgetId: string) => {
    try {
      if (!budgetId) return { success: false }

      await savingsAllocationsStore.fetchSavingAllocations(budgetId)

      return { success: !savingsAllocationsStore.error }
    } catch (error) {
      console.error('Error loading saving allocations:', error)
      return { success: false }
    }
  }

  const loadAllocationSummaryData = async () => {
    const { useBudgetActions } = await import('./useBudgetActions')
    try {
      const financeId = financesStore.profile?.id

      if (financeId) {
        const { fetchCurrentBudget } = useBudgetActions()
        await fetchCurrentBudget(financeId)
      }

      const currentBudgetId = budgetStore.currentBudgetPlan?.id

      if (currentBudgetId) {
        await fetchPlannedIncomeByBudgetId(currentBudgetId)
      }

      if (accountStore.accounts.length < 1) {
        await accountStore.fetchAccounts()
      }

      if (savingsAllocationsStore.savingAllocations.length < 1 && currentBudgetId) {
        await savingsAllocationsStore.fetchSavingAllocations(currentBudgetId)
      }

      return { success: true }
    } catch (error) {
      console.error('Error loading allocation summary data:', error)
      return { success: false }
    }
  }

  const updateNewSavingAmount = (amount: number) => {
    savingsAllocationsStore.setNewSavingAmount(amount)
  }

  const addGoal = async (data: GoalsData) => {
    try {
      const success = await addSavingGoal(data)
      return { success: !!success }
    } catch (error) {
      console.error('Error adding goal:', error)
      return { success: false }
    }
  }

  const editGoal = async (
    id: string,
    data: Partial<GoalsData>
  ): Promise<{ success: boolean }> => {
    try {
      const response = await savingsApi.updateGoal(id, data)
      if (response.success) {
        await fetchGoals()
      }
      return response
    } catch (error) {
      console.error('Error editing goal:', error)
      return { success: false }
    }
  }

  const removeGoal = async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await savingsApi.deleteGoal(id)
      if (response.success) {
        await fetchGoals()
      }
      return response
    } catch (error) {
      console.error('Error deleting goal:', error)
      return { success: false }
    }
  }

  const goals = computed(() => goalsStore.goals)
  const currentBudgetId = computed(() => budgetStore.currentBudgetPlan?.id ?? null)

  const error = computed(() => goalsStore.error || savingsAllocationsStore.error)

  return {
    fetchGoals,
    addSavingGoal,
    loadGoalsData,
    loadSavingAllocations,
    loadAllocationSummaryData,
    updateNewSavingAmount,
    addGoal,
    editGoal,
    removeGoal,
    goals,
    currentBudgetId,
    error
  }
}
