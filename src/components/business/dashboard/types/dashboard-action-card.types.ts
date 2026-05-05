export interface DashboardActionCardProps {
  budgetStatus: 'PLANNED' | 'ACTIVE' | 'CLOSED'
  freeAmount?: number
  currencyCode?: string
}

export interface DashboardActionCardEmits {
  (e: 'define-goals'): void
  (e: 'add-to-goal'): void
  (e: 'plan-expenses'): void
  (e: 'carry-forward'): void
}
