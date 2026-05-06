export interface FinancialHealthGaugeProps {
  score?: number
  level?: 'critical' | 'at_risk' | 'regular' | 'healthy' | 'optimal'
  cashFlowScore?: number
  savingsScore?: number
  expenseScore?: number
  debtScore?: number
  hasDebtModule?: boolean
}
