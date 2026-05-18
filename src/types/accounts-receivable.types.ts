export interface AccountReceivable {
  id: string
  name: string
  debtor?: string
  originalAmount: number
  currentBalance: number
  dueDate?: string
  status: 'pending' | 'partial' | 'collected' | 'overdue'
  notes?: string
  createdAt: string
}

export interface AccountReceivableSummary {
  totalReceivable: number
  overdueCount: number
  expectedThisMonth: number
  nextDueDate: string | null
  collectedThisMonth: number
  byStatus: { pending: number; partial: number; overdue: number }
}

export interface CreateAccountReceivableDto {
  name: string
  debtor?: string
  originalAmount: number
  dueDate?: string
  notes?: string
}

export interface RegisterCollectionDto {
  amount: number
  collectionDate: string
  notes?: string
}
