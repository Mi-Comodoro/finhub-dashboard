export interface DashboardActionCardProps {
  budgetStatus: 'PLANNED' | 'ACTIVE' | 'CLOSED'
  freeAmount?: number
  currencyCode?: string
}

export interface DashboardActionCardEmits {
  (e: 'define-goals' | 'add-to-goal' | 'plan-expenses' | 'carry-forward'): void
}
