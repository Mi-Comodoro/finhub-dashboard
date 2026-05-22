import type {
  CreateTravelExpenseDto,
  TravelExpense,
  UpdateTravelExpenseDto
} from '@/types/travel-expense.types'

export function useTravelExpenseApi() {
  const createExpense = async (data: CreateTravelExpenseDto) =>
    $fetch<{ success: boolean; result: TravelExpense }>('/api/travel-expenses', {
      method: 'POST',
      body: data
    })

  const getByGroup = async (groupId: string) =>
    $fetch<{ success: boolean; result: TravelExpense[] }>(`/api/travel-expenses/group/${groupId}`)

  const getExpense = async (id: string) =>
    $fetch<{ success: boolean; result: TravelExpense }>(`/api/travel-expenses/${id}`)

  const updateExpense = async (id: string, data: UpdateTravelExpenseDto) =>
    $fetch<{ success: boolean; result: TravelExpense }>(`/api/travel-expenses/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deleteExpense = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/travel-expenses/${id}`, { method: 'DELETE' })

  const settleAssignment = async (expenseId: string, userId: string) =>
    $fetch<{ success: boolean }>(`/api/travel-expenses/${expenseId}/settlements`, {
      method: 'POST',
      body: { userId }
    })

  return {
    createExpense,
    getByGroup,
    getExpense,
    updateExpense,
    deleteExpense,
    settleAssignment
  }
}
