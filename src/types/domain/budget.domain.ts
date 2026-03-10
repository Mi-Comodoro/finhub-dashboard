/**
 * Domain Types - Budget Module
 * Core business logic for budgets, categories, and financial planning
 */

export interface BudgetPeriod {
  readonly year: number
  readonly month: number // 1-12
}

export type BudgetFrequency = 'monthly' | 'biweekly'

export interface Category {
  readonly id: string
  readonly name: string
  readonly type: CategoryType
  readonly isDefault: boolean
  readonly iconName: string
  readonly color: string
  readonly parentId: string | null
  readonly sortOrder: number
}

export type CategoryType = 'need' | 'want' | 'saving'

export interface BudgetAllocation {
  readonly categoryId: string
  readonly plannedAmount: number
  readonly actualAmount: number
  readonly remainingAmount: number
  readonly isOverBudget: boolean
}

export interface Budget {
  readonly id: string
  readonly userId: string
  readonly period: BudgetPeriod
  readonly frequency: BudgetFrequency
  readonly totalIncome: number
  readonly totalPlanned: number
  readonly totalActual: number
  readonly allocations: readonly BudgetAllocation[]
  readonly strategy: BudgetStrategy['name']
  readonly isEditable: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface BudgetStrategy {
  readonly name: 'BALANCED' | 'CUSTOM'
  readonly needsPercentage: number // 50% in 50/30/20
  readonly wantsPercentage: number // 30% in 50/30/20
  readonly savingsPercentage: number // 20% in 50/30/20
}

export interface BudgetSummary {
  readonly currentBudget: Budget | null
  readonly nextBudget: Budget | null
  readonly totalCategories: number
  readonly overBudgetCategories: number
  readonly savingsRate: number
}

export interface BudgetMetrics {
  readonly spendingTrend: 'increasing' | 'decreasing' | 'stable'
  readonly categoryBreakdown: readonly CategoryMetric[]
  readonly monthlyComparison: number // percentage change from previous month
}

export interface CategoryMetric {
  readonly categoryId: string
  readonly categoryName: string
  readonly budgetedAmount: number
  readonly actualAmount: number
  readonly variance: number
  readonly variancePercentage: number
}

// Budget actions/requests
export interface CreateBudgetRequest {
  readonly period: BudgetPeriod
  readonly frequency: BudgetFrequency
  readonly totalIncome: number
  readonly strategy: BudgetStrategy['name']
}

export interface UpdateBudgetAllocationRequest {
  readonly budgetId: string
  readonly categoryId: string
  readonly plannedAmount: number
}

/** Domain model for the active budget plan from /budgets/{financeId}/current */
export interface CurrentBudgetPlan {
  readonly id: string
  readonly name: string
  readonly month: string
  readonly year: number
  readonly income: number
  readonly otherIncome: number
  readonly totalIncome: number // income + otherIncome
  readonly isShared: boolean
  readonly partnerIncome: number
  readonly partnerOtherIncome: number
  readonly limits: {
    readonly needs: number // needsLimit %
    readonly wants: number // wantsLimit %
    readonly savings: number // savingsLimit %
  }
  readonly financesId: string
  readonly partnerId: string | null
  readonly strategy: BudgetStrategy['name']
  readonly frequency: BudgetFrequency
}

export interface BudgetState {
  budgets: Budget[]
  budgetPlans: CurrentBudgetPlan[]
  categories: Category[]
  activeBudget: Budget | null
  currentBudgetPlan: CurrentBudgetPlan | null
  summary: BudgetSummary | null
  isLoading: boolean
  error: string | null
}
