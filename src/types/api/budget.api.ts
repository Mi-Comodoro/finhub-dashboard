/**
 * API Types - Budget Module
 * External API contract for budget operations
 */

import type { BudgetFrequency, BudgetStrategy } from '../domain'

/* export interface BudgetApiResponse {
  readonly id: string
  readonly userId: string
  readonly year: number
  readonly month: number
  readonly frequency: string
  readonly totalIncome: number
  readonly totalPlanned: number
  readonly totalActual: number
  readonly allocations: readonly BudgetAllocationApiResponse[]
  readonly strategy: BudgetStrategyApiResponse
  readonly isEditable: boolean
  readonly createdAt: string // ISO string
  readonly updatedAt: string // ISO string
}
 */
export interface BudgetAllocationApiResponse {
  readonly categoryId: string
  readonly plannedAmount: number
  readonly actualAmount: number
}

export interface BudgetStrategyApiResponse {
  readonly name: 'BALANCED' | 'CUSTOM'
  readonly needsPercentage: number
  readonly wantsPercentage: number
  readonly savingsPercentage: number
}

export interface BudgetSummaryApiResponse {
  readonly currentBudget: SingleBudget | null
  readonly nextBudget: SingleBudget | null
  readonly totalCategories: number
  readonly overBudgetCategories: number
  readonly savingsRate: number
}

export interface CreateBudgetApiRequest {
  readonly year: number
  readonly month: number
  readonly frequency: string
  readonly totalIncome: number
  readonly strategy: BudgetStrategyApiResponse
}

// ─── Budget List (from backend /budgets/{financeId}) ─────────────────────────

/** Raw response from the external backend — array of all budgets for a finances */
export type BackendBudgetList = {
  success: boolean
  data: BackendCurrentBudgetData[]
}

/** Response from the Nuxt server handler /api/budgets/[financeId] */
export type BudgetListResponse = {
  success: boolean
  result: SingleBudget[]
}

// ─── Current Budget (from backend /budgets/{financeId}/current) ───────────────

/** Raw response from the external backend */

export type BackendCurrentBudgetData = {
  id: string
  name: string
  month: string
  year: number
  isShared: boolean
  status: string
  needsLimit: number
  wantsLimit: number
  savingsLimit: number
  financesId: string
  ownerId: string | null
  partnerId: string | null
  updatedBy: string | null
  strategy: string
  frequency: string
}
export type BackendCurrentBudget = {
  success: boolean
  data: BackendCurrentBudgetData
}

export type SingleBudget = {
  id: string
  name: string
  month: string
  year: number
  isShared: boolean
  limits: {
    needs: number
    wants: number
    savings: number
  }
  status: 'PLANNED' | 'ACTIVE' | 'CLOSED'
  financesId: string
  ownerId: string | null
  partnerId: string | null
  strategy: BudgetStrategy['name']
  frequency: BudgetFrequency
}
/** Response from the Nuxt server handler /api/budgets/[financeId]/current */
export type CurrentBudget = {
  success: boolean
  result: SingleBudget
}

export interface UpdateBudgetAllocationApiRequest {
  readonly categoryId: string
  readonly plannedAmount: number
}

export interface BudgetMetricsApiResponse {
  readonly spendingTrend: string
  readonly categoryBreakdown: readonly CategoryMetricApiResponse[]
  readonly monthlyComparison: number
}

export interface CategoryMetricApiResponse {
  readonly categoryId: string
  readonly categoryName: string
  readonly budgetedAmount: number
  readonly actualAmount: number
  readonly variance: number
  readonly variancePercentage: number
}
