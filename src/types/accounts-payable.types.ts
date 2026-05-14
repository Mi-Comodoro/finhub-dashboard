export interface AccountPayable {
  id: string
  name: string
  type: 'loan' | 'credit_card' | 'installment' | 'other'
  originalAmount: number
  currentBalance: number
  minimumPayment?: number
  interestRate?: number
  dueDate?: string
  nextPaymentDate?: string
  status: 'active' | 'paid' | 'overdue'
  createdAt: string
}

export interface AccountPayableSummary {
  totalDebt: number
  monthlyCommitments: number
  overdueCount: number
  nextDueDate: string | null
  debtToIncomeRatio: number
  byType: Record<string, number>
}

export interface CreateAccountPayableDto {
  name: string
  type: 'loan' | 'credit_card' | 'installment' | 'other'
  originalAmount: number
  minimumPayment?: number
  interestRate?: number
  dueDate?: string
  nextPaymentDate?: string
  notes?: string
}

export interface RegisterPaymentDto {
  amount: number
  paymentDate: string
  notes?: string
}
