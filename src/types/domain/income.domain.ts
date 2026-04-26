import type { StoreError } from './common.domain'

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
  date: Date | string
  status: 'PENDING' | 'RECEIVED' | 'SKIPPED'
  budgetId: string
  incomeSourceId?: string
  createdAt?: Date | string
  updatedAt: Date | string
}

export interface PlannedSavingSummary {
  id: string
  amount: number
  date: Date | string
  status: 'pending' | 'completed'
  completedAt?: string | null
  savingGoal?: { id: string; name: string; reason: string }
  account?: { id: string; name: string }
  plannedIncome?: { id: string; amount: number; date: string; source: string }
  accountId?: string
  budgetId: string
  plannedIncomeId?: string
  savingGoalId?: string
}

export interface PlannedSavingState {
  items: PlannedSavingSummary[] | null
  budgetId: string
  isLoading: boolean
  error: StoreError | null
}

export interface PlannedIncomeState {
  budgetId: string
  summary: PlannedIncomeSummary[] | null
  isLoading: boolean
  processingIncomeId: string | null
  error: StoreError | null
  expectedIncome: number
}

export interface IncomeState {
  incomes: Income[]
  expectedIncomes: ExpectedIncome[]
  summary: IncomeSummary | null
  isLoading: boolean
  error: string | null
}
