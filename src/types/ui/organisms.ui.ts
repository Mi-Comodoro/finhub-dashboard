/**
 * UI Types - Organisms
 * Complex components combining molecules and atoms
 */

export interface WizardProps {
  readonly currentStep: number
  readonly totalSteps: number
  readonly canGoNext?: boolean
  readonly canGoPrevious?: boolean
  readonly isLoading?: boolean
}

export interface WizardEmits {
  'step:next': []
  'step:previous': []
  'step:goto': [step: number]
  'wizard:complete': []
}

export type OnBoardingFinances = {
  currency: string
  profile: 'employee' | 'freelancer' | 'business_owner'
}
export type OnboardingFormData = {
  personalInfo: {
    displayName: string
    phone: string
    email: string
    gender: string
  }
  finances: OnBoardingFinances
  budget: {
    strategy: 'BALANCED' | 'CUSTOM'
    usage: 'personal' | 'shared' | null
    customAllocations: {
      needs: number
      wants: number
      savings: number
    }
  }
  incomes: {
    incomes: {
      source: string
      amount: number
      isAdditional: boolean
    }[]
    frequency: 'monthly' | 'biweekly'
    paymentsDates: Date | [Date, Date] | null
  }
}

export interface LoginFormProps {
  isLoading?: boolean
  error?: string
}

export interface LoginFormEmits {
  'auth:google': []
}

export interface BudgetSummaryCardProps {
  totalIncome: number
  totalPlanned: number
  totalActual: number
  period: {
    year: number
    month: number
  }
  isEditable?: boolean
  isLoading?: boolean
}

export interface BudgetSummaryCardEmits {
  'budget:edit': []
  'budget:view-details': []
}

export interface CategoryCardProps {
  categoryId: string
  categoryName: string
  plannedAmount: number
  actualAmount: number
  remainingAmount: number
  isOverBudget: boolean
  iconName: string
  color: string
  isEditable?: boolean
}

export interface CategoryCardEmits {
  'category:update': [categoryId: string, amount: number]
  'category:view-details': [categoryId: string]
}

export interface DashboardHeaderProps {
  readonly userName: string
  readonly currentPeriod: {
    readonly year: number
    readonly month: number
  }
  readonly nextPeriod: {
    readonly year: number
    readonly month: number
  }
}

export interface DashboardHeaderEmits {
  'period:change': [year: number, month: number]
  'user:logout': []
}
