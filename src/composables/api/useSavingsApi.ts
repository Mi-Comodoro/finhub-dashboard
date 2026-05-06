import type { GoalHistory, GoalsData, SavingAllocationData } from '@/types/api/'
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

  const updateGoal = async (
    id: string,
    data: Partial<GoalsData>
  ): Promise<{ success: boolean }> => {
    const response = await $fetch<{ success: boolean }>(`/api/savings/goals/${id}`, {
      method: 'PATCH',
      body: data
    })
    return response
  }

  const deleteGoal = async (id: string): Promise<{ success: boolean }> =>
    $fetch<{ success: boolean }>(`/api/savings/goals/${id}`, { method: 'DELETE' })

  const getGoal = async (id: string) =>
    $fetch<{ success: boolean; result: GoalsData }>(`/api/savings/goals/${id}`, { method: 'GET' })

  const getGoalHistory = async (id: string) =>
    $fetch<{ success: boolean; result: GoalHistory[] }>(`/api/savings/goals/${id}/history`, {
      method: 'GET'
    })

  const createContribution = async (
    goalId: string,
    data: {
      contributionType: string
      accountId?: string
      amount: number
      date: Date
      notes?: string
    }
  ) =>
    $fetch<{ success: boolean }>(`/api/savings/goals/${goalId}/contributions`, {
      method: 'POST',
      body: data
    })

  const createPlannedSaving = async (data: {
    amount: number
    budgetId: string
    plannedIncomeId: string
    status: 'pending'
  }) =>
    $fetch<{ success: boolean; result: PlannedSavingSummary }>('/api/savings/planned', {
      method: 'POST',
      body: data
    })

  return {
    getPlannedSavingsByBudget,
    updatePlannedSaving,
    getAllocationsByBudget,
    createAllocation,
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    getGoal,
    getGoalHistory,
    createContribution,
    createPlannedSaving
  }
}
