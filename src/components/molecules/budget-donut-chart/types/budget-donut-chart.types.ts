import type { Currency } from '@/utils/currency'

export interface BudgetDonutItem {
  id: string
  name: string
  type: 'needs' | 'wants' | 'savings'
  budgeted: number
  percentage: number
}

export interface BudgetDonutChartProps {
  items?: BudgetDonutItem[]
  total?: number
  currency?: Currency
  showLegend?: boolean
}
