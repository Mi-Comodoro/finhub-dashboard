export interface SavingAllocationData {
  id: string
  percentage: number
  goalId: string
  budgetId: string
  updatedAt: Date
}
export interface SavingAllocationResponseApi {
  success: boolean
  data: SavingAllocationData[]
}
export interface SavingAllocationResponseList {
  success: boolean
  result: SavingAllocationData[]
}
