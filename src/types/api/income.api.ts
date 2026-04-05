/**
 * API Types - Income Module
 * External API contract for income operations
 */

export interface IncomeApiResponse {
  readonly id: string
  readonly userId: string
  readonly source: string
  readonly amount: number
  readonly date: string // ISO string
  readonly frequency?: string
  readonly category?: string
  readonly description?: string
  readonly createdAt: string // ISO string
  readonly updatedAt: string // ISO string
}

export interface ExpectedIncomeApiResponse {
  readonly source: string
  readonly amount: number
  readonly date: string // ISO string
}

export interface CurrentIncomesApiResponse {
  readonly expectedIncomes: readonly ExpectedIncomeApiResponse[]
  readonly totalExpectedIncomes: number
}

export interface IncomeSummaryApiResponse {
  readonly totalExpected: number
  readonly totalActual: number
  readonly expectedIncomes: readonly ExpectedIncomeApiResponse[]
}

export interface PlannedIncomeApiResponse {
  readonly id: string
  readonly amount: number
  readonly source: string
  readonly date: string
  readonly status: 'PENDING' | 'RECEIVED' | 'SKIPPED'
  readonly budgetId: string
  readonly incomeSourceId?: string
  readonly createdAt?: string
  readonly updatedAt: string
}

export interface PlannedSavingApiResponse {
  readonly id: string
  readonly amount: number
  readonly date: string
  readonly status: string
  readonly accountId: string
  readonly budgetId: string
  readonly plannedIncomeId: string
  readonly savingGoalId: string
}

export interface PlannedIncomeUpdateApiResponse {
  readonly success: boolean
  readonly data: {
    readonly plannedIncome: PlannedIncomeApiResponse
    readonly plannedSavings: readonly PlannedSavingApiResponse[]
  }
}
