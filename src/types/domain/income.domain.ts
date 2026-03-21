/**
 * Domain Types - Income Module
 * Core business logic for income management
 */

export interface Income {
  readonly id: string
  readonly userId: string
  readonly source: string
  readonly amount: number
  readonly date: Date
  readonly isRecurring: boolean
  readonly frequency?: IncomeFrequency
  readonly category?: string
  readonly description?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type IncomeFrequency = 'monthly' | 'weekly' | 'biweekly' | 'yearly'

export interface ExpectedIncome {
  readonly source: string
  readonly amount: number
  readonly date: Date
}

export interface IncomeSummary {
  totalExpected: number
  expectedIncomes: readonly ExpectedIncome[]
  lastUpdate: Date
  period: {
    year: number
    month: number
  }
}

export interface PlannedIncomeSummary {
  id: string
  amount: number
  source: string
  date: Date
  status: 'PENDING' | 'RECEIVED' | 'SKIPPED'
  budgetId: string
  updatedAt: Date
}

export interface PlannedIncomeState {
  budgetId: string
  summary: PlannedIncomeSummary[] | null
  isLoading: boolean
  error: string | null
  expectedIncome: number
  needsAmount: number
  savingsAmount: number
  wantsAmount: number
}

export interface IncomeState {
  incomes: Income[]
  expectedIncomes: ExpectedIncome[]
  summary: IncomeSummary | null
  isLoading: boolean
  error: string | null
}
