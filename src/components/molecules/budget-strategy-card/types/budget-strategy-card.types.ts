import type { BudgetAllocation } from '../../index'

export type BudgetStrategyCardProps = {
  title: string
  description: string
  allocation: BudgetAllocation
  icon?: string
  recommended?: boolean
  advanced?: boolean
  selected?: boolean
  selectable?: boolean
}
