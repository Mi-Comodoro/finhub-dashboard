import type { DebtProjectionResponse, NetPositionResponse } from '@/types/analytics.types'

export interface FinancialHealthScoreResponse {
  totalScore: number
  cashFlowScore: number
  savingsScore: number
  expenseScore: number
  debtScore: number
  level: 'critical' | 'at_risk' | 'regular' | 'healthy' | 'optimal'
  calculatedAt: string
  // TODO: [BE] incluir este campo en el servicio analytics/financial-health-score.
  // Con 0 transacciones el backend devuelve scores en 0 que son engañosos en la UI.
  // Agregar count de transacciones del presupuesto activo al calcular el score.
  totalTransactions?: number
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

  const getCashFlowForecast = (year: number, month: number) =>
    $fetch<{ success: boolean; result: CashFlowForecastResponse }>(
      `/api/analytics/cash-flow-forecast?year=${year}&month=${month}`
    )

  const getNetPosition = () =>
    $fetch<{ success: boolean; result: NetPositionResponse }>('/api/analytics/net-position')

  const getDebtProjection = () =>
    $fetch<{ success: boolean; result: DebtProjectionResponse }>('/api/analytics/debt-projection')

  return {
    getFinancialHealthScore,
    getSavingsTrend,
    getCashFlowForecast,
    getNetPosition,
    getDebtProjection
  }
}
