import type { TransactionType } from '../api'
import type { StoreError } from './common.domain'

export interface TransactionSummary {
  id: string
  amount: number
  type: TransactionType
  source: string
  transactionDate: string
  category?: { id: string; name: string }
  accountId?: string
  account?: { id: string; name: string }
  fromAccountId?: string
  fromAccount?: { id: string; name: string }
  toAccountId?: string
  toAccount?: { id: string; name: string }
  plannedIncomeId?: string
  plannedExpenseId?: string
  description?: string
  createdAt?: string
  updatedAt?: string
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

export interface TransactionTotals {
  income: number
  expense: number
  savings: number
  countIncome: number
  countExpense: number
  countSavings: number
}

export interface TransactionState {
  items: TransactionSummary[] | null
  budgetId: string
  filters: TransactionFilters
  pagination: TransactionPagination | null
  totals: TransactionTotals | null
  isLoading: boolean
  error: StoreError | null
}
