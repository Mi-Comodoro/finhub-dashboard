import type { TransactionPagination, TransactionSummary } from '~/types/domain'

export interface TransactionData {
  budgetId: string
  categoryId?: string
  amount: number
  type: 'income' | 'expense' | 'savings'
  source: string
  transactionDate: Date | string
  description?: string
}

export function useTransactionApi() {
  const getTransactionsByBudget = async (budgetId: string, query: string) =>
    $fetch<{
      success: boolean
      result: {
        transactions: TransactionSummary[]
        pagination: TransactionPagination
      }
    }>(`/api/transactions/by-budget/${budgetId}?${query}`)

  const createTransaction = async (data: TransactionData) =>
    $fetch<{
      success: boolean
      result: {
        id: string
        budgetId: string
        categoryId: string | null
        amount: number
        type: string
        source: string
        transactionDate: Date
        description: string | null
        createdAt: Date
        updatedAt: Date
      }
    }>('/api/transactions', {
      method: 'POST',
      body: data
    })

  const updateTransaction = async (id: string, data: Partial<TransactionData>) =>
    $fetch<{
      success: boolean
      result: {
        id: string
        budgetId: string
        categoryId: string | null
        amount: number
        type: string
        source: string
        transactionDate: Date
        description: string | null
        createdAt: Date
        updatedAt: Date
      }
    }>(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: data
    })

  const deleteTransaction = async (id: string) =>
    $fetch<{
      success: boolean
      result: { id: string }
    }>(`/api/transactions/${id}`, {
      method: 'DELETE'
    })

  return {
    getTransactionsByBudget,
    createTransaction,
    updateTransaction,
    deleteTransaction
  }
}
