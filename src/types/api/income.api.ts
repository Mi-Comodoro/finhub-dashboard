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
