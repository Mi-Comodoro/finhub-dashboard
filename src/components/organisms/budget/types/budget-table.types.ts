import type { CurrentBudgetPlan } from '@/types/domain'
import type { Currency } from '@/utils/currency'

export interface BudgetTableProps {
  plans: CurrentBudgetPlan[]
  avgExecution: number
  nextClosingDate: string
  currency: Currency
  selectedYear: number
  pageSize?: number
}
