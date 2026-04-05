import type { HeadingColor, TextColor } from '~/components/atoms'

export type BudgetInsightsVariant =
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'danger'
  | 'gold'
  | 'accent'
  | undefined
export type BudgetInsightsData = {
  id: string
  title?: string
  subtitle?: string
  amount?: number | null
  targetAmount?: number
  progressLabel?: string
  targetDate?: string
  status?: string
  iconName?: string
  iconMark?: string
  iconTextClass?: string
  iconBgClass?: string
  currencyTextClass?: string
  showProgressbar?: boolean
  showAlert?: boolean
  progressPercentage?: number
  pendingPercentage?: number
  textFooter?: string
  titleColor?: HeadingColor
  textColor?: HeadingColor
  subTitleColor?: TextColor
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'gold' | 'accent' | undefined
}
