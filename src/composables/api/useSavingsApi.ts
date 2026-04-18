import type { GoalsData, SavingAllocationData } from '@/types/api/'
import type { PlannedSavingSummary } from '~/types/domain'

export function useSavingsApi() {
  const getPlannedSavingsByBudget = async (budgetId: string) =>
    $fetch<{ success: boolean; result: PlannedSavingSummary[] }>(
      `/api/savings/planned/by-budget/${budgetId}`
    )

  const updatePlannedSaving = async (id: string) =>
    $fetch<{ success: boolean; result: PlannedSavingSummary }>(`/api/savings/planned/${id}`, {
      method: 'PATCH'
    })

  const getAllocationsByBudget = async (budgetId: string) =>
    $fetch<{ success: boolean; result: SavingAllocationData[] }>(
      `/api/savings/allocations/${budgetId}`
    )

  const createAllocation = async (data: { percentage: number; goalId: string; budgetId: string }) =>
    $fetch<{ success: boolean }>('/api/savings/allocations/create', { method: 'POST', body: data })

  const createGoal = async (data: GoalsData) =>
    $fetch<{ success: boolean }>('/api/savings/goals/create', { method: 'POST', body: data })

  const getGoals = async () =>
    $fetch<{ success: boolean; result: GoalsData[] }>('/api/savings/goals/find', { method: 'GET' })

  return {
    getPlannedSavingsByBudget,
    updatePlannedSaving,
    getAllocationsByBudget,
    createAllocation,
    createGoal,
    getGoals
  }
}
