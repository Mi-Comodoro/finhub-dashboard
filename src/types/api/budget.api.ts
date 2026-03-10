/**
 * API Types - Budget Module
 * External API contract for budget operations
 */

import type { BudgetFrequency, BudgetStrategy } from '../domain'

export interface BudgetApiResponse {
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

export interface CategoryApiResponse {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly isDefault: boolean
  readonly iconName: string
  readonly color: string
  readonly parentId: string | null
  readonly sortOrder: number
}

export interface BudgetSummaryApiResponse {
  readonly currentBudget: BudgetApiResponse | null
  readonly nextBudget: BudgetApiResponse | null
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
  data: Array<BackendCurrentBudgetData>
}

/** Response from the Nuxt server handler /api/budgets/[financeId] */
export type BudgetListResponse = {
  success: boolean
  result: Array<{
    id: string
    name: string
    month: string
    year: number
    income: number
    otherIncome: number
    isShared: boolean
    partnerIncome: number
    partnerOtherIncome: number
    limits: {
      needs: number
      wants: number
      savings: number
    }
    financesId: string
    partnerId: string | null
    strategy: BudgetStrategy['name']
    frequency: BudgetFrequency
  }> | null
}

// ─── Current Budget (from backend /budgets/{financeId}/current) ───────────────

/** Raw response from the external backend */
export type BackendCurrentBudgetData = {
  id: string
  name: string
  month: string
  year: number
  income: number
  otherIncome: number
  isShared: boolean
  partnerIncome: number
  partnerOtherIncome: number
  needsLimit: number
  wantsLimit: number
  savingsLimit: number
  financesId: string
  partnerId: string | null
  updatedBy: string | null
  strategy: string
  frequency: string
}
export type BackendCurrentBudget = {
  success: boolean
  data: BackendCurrentBudgetData
}

/** Response from the Nuxt server handler /api/budgets/[financeId]/current */
export type CurrentBudget = {
  success: boolean
  result: {
    id: string
    name: string
    month: string
    year: number
    income: number
    otherIncome: number
    isShared: boolean
    partnerIncome: number
    partnerOtherIncome: number
    limits: {
      needs: number
      wants: number
      savings: number
    }
    financesId: string
    partnerId: string | null
    strategy: BudgetStrategy['name']
    frequency: BudgetFrequency
  } | null
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
