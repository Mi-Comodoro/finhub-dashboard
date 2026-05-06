export interface FinancialHealthScoreResponse {
  totalScore: number
  cashFlowScore: number
  savingsScore: number
  expenseScore: number
  debtScore: number
  level: 'critical' | 'at_risk' | 'regular' | 'healthy' | 'optimal'
  calculatedAt: string
}

export function useAnalyticsApi() {
  const getFinancialHealthScore = () =>
    $fetch<{ success: boolean; result: FinancialHealthScoreResponse }>(
      '/api/analytics/financial-health-score'
    )

  return { getFinancialHealthScore }
}
