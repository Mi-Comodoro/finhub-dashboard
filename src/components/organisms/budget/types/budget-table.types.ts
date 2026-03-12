import type { BudgetStatus } from '@/composables/useBudgetPeriod'
import type { CurrentBudgetPlan } from '@/types/domain'
import type { Currency } from '@/utils/currency'

export interface BudgetTableProps {
  plans: CurrentBudgetPlan[]
  currency: Currency
  selectedYear: number
  pageSize?: number
}

export type PlanRow = CurrentBudgetPlan & { status: BudgetStatus }
