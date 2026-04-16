import type { PlannedIncomeSummary, PlannedSavingSummary } from '~/types/domain'

export function useIncomeApi() {

  const getCurrentIncome = async () =>
    $fetch<{ success: boolean; result: unknown }>(
      '/api/incomes/current'
    )

  const getPlannedIncomes = async () =>
    $fetch<{ success: boolean; result: PlannedIncomeSummary[] }>(
      '/api/incomes/planned'
    )

  const getPlannedIncomesByBudget = async (budgetId: string) =>
    $fetch<{ success: boolean; result: PlannedIncomeSummary[] }>(
      `/api/incomes/planned/by-budget/${budgetId}`
    )

  const markPlannedIncomeAsReceived = async (id: string) =>
    $fetch<{
      success: boolean
      result: {
        plannedIncome: PlannedIncomeSummary | null
        plannedSavings: PlannedSavingSummary[]
      } | null
    }>(
      `/api/incomes/planned/${id}`,
      { method: 'PATCH' }
    )

  const updatePlannedIncome = async (id: string, data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: unknown }>(
      `/api/incomes/planned/${id}`,
      { method: 'PATCH', body: data }
    )

  const createPlannedIncome = async (data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: PlannedIncomeSummary }>(
      '/api/incomes/planned',
      { method: 'POST', body: data }
    )

  const deletePlannedIncome = async (id: string) =>
    $fetch<{ success: boolean; result: { id: string } }>(
      `/api/incomes/planned/${id}`,
      { method: 'DELETE' }
    )

  return {
    getCurrentIncome,
    getPlannedIncomes,
    getPlannedIncomesByBudget,
    markPlannedIncomeAsReceived,
    updatePlannedIncome,
    createPlannedIncome,
    deletePlannedIncome
  }
}
