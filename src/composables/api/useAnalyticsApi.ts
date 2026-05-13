export interface FinancialHealthScoreResponse {
  totalScore: number
  cashFlowScore: number
  savingsScore: number
  expenseScore: number
  debtScore: number
  level: 'critical' | 'at_risk' | 'regular' | 'healthy' | 'optimal'
  calculatedAt: string
}

export interface SavingsTrendItem {
  id: string
  amount: number
  transactionDate: string
}

export interface CashFlowForecastResponse {
  months: Array<{
    month: string
    projectedIncome: number
    projectedExpenses: number
    projectedNet: number
  }>
  assumptions: {
    basedOnBudget: boolean
    incomeConstant: boolean
    expensesConstant: boolean
  }
}

export function useAnalyticsApi() {
  const getFinancialHealthScore = () =>
    $fetch<{ success: boolean; result: FinancialHealthScoreResponse }>(
      '/api/analytics/financial-health-score'
    )

  const getSavingsTrend = (year: number) =>
    $fetch<{ success: boolean; result: SavingsTrendItem[] }>(
      `/api/analytics/savings-trend?year=${year}`
    )

  const getCashFlowForecast = () =>
    $fetch<{ success: boolean; result: CashFlowForecastResponse }>(
      '/api/analytics/cash-flow-forecast'
    )

  return { getFinancialHealthScore, getSavingsTrend, getCashFlowForecast }
}
