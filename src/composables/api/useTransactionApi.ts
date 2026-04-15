import type { TransactionPagination, TransactionSummary } from '~/types/domain'

export function useTransactionApi() {
  const getTransactionsByBudget = async (budgetId: string, query: string) =>
    $fetch<{
      success: boolean
      result: {
        transactions: TransactionSummary[]
        pagination: TransactionPagination
      }
    }>(`/api/transactions/by-budget/${budgetId}?${query}`)

  return {
    getTransactionsByBudget
  }
}
