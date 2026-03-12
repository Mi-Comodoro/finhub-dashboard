export type CanonicalStrategy = 'BALANCED' | 'CUSTOM'
export type StrategyValue = CanonicalStrategy | 'balanced' | 'custom'

export interface StrategyFormInput {
  strategy: StrategyValue
  customAllocations: {
    needs: number
    wants: number
    savings: number
  }
}

export interface StrategyFormData {
  strategy: CanonicalStrategy
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
