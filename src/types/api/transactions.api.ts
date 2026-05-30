export type TransactionType = 'income' | 'expense' | 'savings' | 'interest'
export interface Transaction {
  id?: string
  amount: number
  source: string
  description?: string

  // IDs directos
  userId: string
  budgetId: string
  categoryId: string
  billId?: string
  plannedExpenseId?: string
  plannedIncomeId?: string
  accountId?: string
  savingGoalId?: string

  // tipo
  type: TransactionType

  // relaciones enriquecidas opcionales (para vistas)
  category?: { id: string; name: string }
  account?: { id: string; name: string }
  fromAccountId?: string
  fromAccount?: { id: string; name: string }
  toAccountId?: string
  toAccount?: { id: string; name: string }

  // fechas
  transactionDate: Date
  nulledAt?: Date
  createdAt?: Date
  updatedAt?: Date
}
export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
}

export interface TransactionPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}
