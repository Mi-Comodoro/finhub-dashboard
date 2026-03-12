export type FinancialUsageInput = 'personal' | 'shared' | 'PERSONAL' | 'SHARED'
export type FinancialUsage = 'personal' | 'shared'

export interface FinancialGoalsData {
  currency: 'COP' | 'USD'
  profile?: 'EMPLOYEE' | 'FREELANCER' | 'BUSINESS_OWNER'
  usage?: FinancialUsageInput
  budgetFrequency?: 'MONTHLY' | 'BIWEEKLY' | null
}

export interface OnBoardingFinances {
  currency: 'COP' | 'USD'
  profile: 'EMPLOYEE' | 'FREELANCER' | 'BUSINESS_OWNER'
  usage: FinancialUsage
  budgetFrequency?: 'MONTHLY' | 'BIWEEKLY'
}

export interface FinancialGoalsFormProps {
  modelValue?: FinancialGoalsData
}

export interface FinancialGoalsFormEmits {
  'update:modelValue': [value: FinancialGoalsData]
  valid: [isValid: boolean]
}
