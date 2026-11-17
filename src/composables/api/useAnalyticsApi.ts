import type { DebtProjectionResponse, NetPositionResponse } from '@/types/analytics.types'

export interface HealthScorePillar {
  score: number
  max: number
  label: string
  rate?: number
  excessPct?: number
  dti?: number
}

export interface FinancialHealthScoreResponse {
  score: {
    total: number
    label: string
    pillars: {
      cashFlow: HealthScorePillar
      savings: HealthScorePillar
      expenses: HealthScorePillar
      debt: HealthScorePillar
    }
    insight: string
    weakestPillar: string
  }
  debtRatio: {
    ratio: number
    label: string
    badge: string
    totalDebt: number
    annualIncomeEstimate: number
  }
  totalTransactions: number
  totals: {
    income: number
    expenses: number
    savings: number
  }
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
  // En SSR reenvia la cookie de sesion del request entrante (sin esto el BFF responde 401 al recargar)
  const requestFetch = import.meta.server ? useRequestFetch() : $fetch

  const getFinancialHealthScore = () =>
    requestFetch<{ success: boolean; result: FinancialHealthScoreResponse }>(
      '/api/analytics/financial-health-score'
    )

  const getSavingsTrend = (year: number) =>
    requestFetch<{ success: boolean; result: SavingsTrendItem[] }>(
      `/api/analytics/savings-trend?year=${year}`
    )

  const getCashFlowForecast = (year: number, month: number) =>
    requestFetch<{ success: boolean; result: CashFlowForecastResponse }>(
      `/api/analytics/cash-flow-forecast?year=${year}&month=${month}`
    )

  const getNetPosition = () =>
    requestFetch<{ success: boolean; result: NetPositionResponse }>('/api/analytics/net-position')

  const getDebtProjection = () =>
    requestFetch<{ success: boolean; result: DebtProjectionResponse }>(
      '/api/analytics/debt-projection'
    )

  return {
    getFinancialHealthScore,
    getSavingsTrend,
    getCashFlowForecast,
    getNetPosition,
    getDebtProjection
  }
}
