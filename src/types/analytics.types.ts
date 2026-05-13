export interface NetPositionResponse {
  totalAssets: number
  totalDebts: number
  totalReceivable: number
  netPosition: number
  debtToIncomeRatio: number
  summary: {
    accountsPayable: { total: number; monthlyCommitment: number; overdueCount: number }
    accountsReceivable: { total: number; expectedThisMonth: number; overdueCount: number }
  }
}

export interface DebtProjectionResponse {
  simplified?: boolean
  projection: Array<{
    month: string
    projectedBalance: number
    minimumPayments: number
  }>
}
