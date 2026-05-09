import type { TransactionType } from '../api'
import type { StoreError } from './common.domain'

export interface TransactionSummary {
  id: string
  amount: number
  type: TransactionType
  source: string
  transactionDate: string
  category?: { id: string; name: string }
  plannedIncomeId?: string
  plannedExpenseId?: string
  description?: string
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface TransactionPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TransactionState {
  items: TransactionSummary[] | null
  budgetId: string
  filters: TransactionFilters
  pagination: TransactionPagination | null
  isLoading: boolean
  error: StoreError | null
}
