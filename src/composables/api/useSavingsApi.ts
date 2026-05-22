import type {
  GoalHistory,
  GoalsData,
  PlannedSaving,
  SavingAllocationData,
  Transaction
} from '@/types/api'
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
      amount: number
      date: string
      note?: string
    }
  ) =>
    $fetch<{ success: boolean; result: PlannedSaving }>(
      `/api/savings/goals/${goalId}/contributions`,
      {
        method: 'POST',
        body: { amount: data.amount, date: data.date, notes: data.note }
      }
    )

  const updateGoalStatus = async (id: string, status: string) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/savings/goals/${id}/status`, {
      method: 'PATCH',
      body: { status }
    })

  const getGoalContributions = async (goalId: string) =>
    $fetch<{ success: boolean; result: Transaction[] }>(
      `/api/savings/goals/${goalId}/contributions`,
      {
        method: 'GET'
      }
    )

  const getGoalSummary = async (goalId: string) =>
    $fetch<{ success: boolean; result: { totalSavings: number; totalInterest: number } }>(
      `/api/savings/goals/${goalId}/summary`,
      { method: 'GET' }
    )

  const registerGoalInterest = async (goalId: string, amount: number, date: string) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/savings/goals/${goalId}/interest`, {
      method: 'POST',
      body: { amount, date }
    })

  const createPlannedSaving = async (data: {
    amount: number
    budgetId: string
    plannedIncomeId?: string
    savingGoalId?: string
  }) =>
    $fetch<{ success: boolean; result: PlannedSavingSummary }>('/api/savings/planned', {
      method: 'POST',
      body: data
    })

  const assignGoalToPlannedSaving = async (id: string, savingGoalId: string) =>
    $fetch<{ success: boolean; result: PlannedSavingSummary }>(`/api/savings/planned/${id}/goal`, {
      method: 'PATCH',
      body: { savingGoalId }
    })

  return {
    getPlannedSavingsByBudget,
    updatePlannedSaving,
    getAllocationsByBudget,
    createAllocation,
    createGoal,
    getGoals,
    updateGoal,
    updateGoalStatus,
    deleteGoal,
    getGoal,
    getGoalHistory,
    createContribution,
    getGoalContributions,
    getGoalSummary,
    registerGoalInterest,
    createPlannedSaving,
    assignGoalToPlannedSaving
  }
}
