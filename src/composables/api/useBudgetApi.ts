import type { Budget } from '~/types/domain'

export interface UpdateBudgetDto {
  name?: string
  strategy?: 'BALANCED' | 'CUSTOM'
  needsLimit?: number
  wantsLimit?: number
  savingsLimit?: number
}

export function useBudgetApi() {
  const getBudgets = async (financeId: string, year?: number) => {
    const query = year ? `?year=${year}` : ''
    return $fetch<{ success: boolean; result: unknown }>(
      `/api/budgets/finances/${financeId}${query}`
    )
  }

  const getCurrentBudget = async (financeId: string, month?: string, year?: string) => {
    const params = new URLSearchParams()
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    const query = params.toString() ? `?${params}` : ''
    return $fetch<{ success: boolean; result: unknown }>(
      `/api/budgets/current/${financeId}${query}`
    )
  }

  const getBudgetById = async (budgetId: string) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/budgets/plan/${budgetId}`)

  const createBudget = async (data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: Budget }>('/api/budgets', { method: 'POST', body: data })

  const updateBudget = async (id: string, data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/budgets/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deleteBudget = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/budgets/${id}`, { method: 'DELETE' })

  const enableBudget = async (budgetId: string) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/budgets/enable/${budgetId}`, {
      method: 'POST'
    })
  const closeBudget = async (
    budgetId: string,
    body?: { surplusAction?: 'transfer_to_goal' | 'carry_forward' | 'ignore'; targetGoalId?: string }
  ) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/budgets/close/${budgetId}`, {
      method: 'POST',
      body
    })

  const cloneBudget = async (sourceBudgetId: string, month: number, year: number) =>
    $fetch<{ success: boolean; result: Budget }>('/api/budgets', {
      method: 'POST',
      body: { mode: 'clone', sourceBudgetId, month, year }
    })

  return {
    getBudgets,
    getCurrentBudget,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    enableBudget,
    closeBudget,
    cloneBudget
  }
}
