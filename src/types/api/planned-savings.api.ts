export type PlannedSavingStatus = 'pending' | 'skipped' | 'completed'
export type PlannedSavingType = 'aporte' | 'interes' | 'ajuste'
export interface PlannedSaving {
  id: string
  amount: number
  date: Date
  status: PlannedSavingStatus
  type?: PlannedSavingType
  note?: string
  completedAt: string // ISO string del backend
  accountId: string
  budgetId: string
  plannedIncomeId: string
  savingGoalId: string
  account?: { id: string; name: string }
  savingGoal?: { id: string; name: string; reason: string }
  plannedIncome?: { id: string; amount: number; date: Date; source: string }
}
