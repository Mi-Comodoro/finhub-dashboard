export type CanonicalStrategy = 'BALANCED' | 'CUSTOM'

export type StrategyValue = CanonicalStrategy | 'BALANCED' | 'CUSTOM'

export type UsageValue = 'personal' | 'shared'

export interface StrategyFormInput {
  strategy: StrategyValue | null
  usage: UsageValue | null
  customAllocations: {
    needs: number
    wants: number
    savings: number
  }
}

export interface StrategyFormData {
  strategy: CanonicalStrategy | null
  usage: UsageValue | null
  customAllocations: {
    needs: number
    wants: number
    savings: number
  }
}

export interface BudgetStrategyFormProps {
  strategySelected?: CanonicalStrategy | null
  modelValue?: StrategyFormInput
}
