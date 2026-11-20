import type { ExpenseData } from '~/types/domain'

type ExpenseStatus = 'PLANNED' | 'PAID' | 'CANCELED' | 'SKIPPED'

export function useExpenseApi() {
  const createExpense = async (data: ExpenseData) =>
    $fetch<{
      success: boolean
      result: {
        id: string
        budgetId: string
        categoryId: string
        name: string
        expectedAmount: number
        dueDate: Date
        status: string
        isEssential: boolean
        notes: string
        billsId: string | null
        createdAt: Date
        updatedAt: Date
      }
    }>('/api/expense', {
      method: 'POST',
      body: data
    })

  const findAllExpenses = async (query?: Record<string, unknown>) =>
    $fetch<{
      success: boolean
      result: {
        data: Array<{
          id: string
          budgetId: string
          category: string
          bucket: string
          name: string
          expectedAmount: number
          dueDate: Date | string
          status: ExpenseStatus
          isEssential: boolean
          notes?: string
          billsId?: string | null
          customBucketId?: string | null
          createdAt: Date | string
          updatedAt: Date | string
        }>
        meta: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }
    }>('/api/expense/findAll', {
      method: 'GET',
      query
    })

  const completeExpense = async (id: string) =>
    $fetch<{
      success: boolean
      result: {
        plannedExpense: { id: string; status: ExpenseStatus }
        transaction: { id: string; amount: number; type: string }
      }
    }>(`/api/expense/${id}/complete`, {
      method: 'PATCH'
    })

  const updateExpense = async (id: string, data: Partial<ExpenseData>) =>
    $fetch<{
      success: boolean
      result: {
        id: string
        budgetId: string
        categoryId: string
        name: string
        expectedAmount: number
        dueDate: Date
        status: string
        isEssential: boolean
        notes: string
        billsId: string | null
        createdAt: Date
        updatedAt: Date
      }
    }>(`/api/expense/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deleteExpense = async (id: string) =>
    $fetch<{
      success: boolean
      result: { id: string }
    }>(`/api/expense/${id}`, {
      method: 'DELETE'
    })

  return {
    createExpense,
    findAllExpenses,
    completeExpense,
    updateExpense,
    deleteExpense
  }
}
