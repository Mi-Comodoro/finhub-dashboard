export type SplitType = 'EQUAL' | 'CUSTOM' | 'PERCENTAGE'

export interface TravelExpenseAssignment {
  userId: string
  userName?: string
  amount: number
  percentage?: number
  settled: boolean
}

export interface TravelExpense {
  id: string
  description: string
  amount: number
  expenseDate: string
  splitType: SplitType
  paidBy: string
  groupId: string
  assignments: TravelExpenseAssignment[]
  createdAt: string
}

export interface CreateTravelExpenseDto {
  description: string
  amount: number
  expenseDate: string
  splitType: SplitType
  groupId: string
  paidBy?: string
  assignments?: {
    userId: string
    amount?: number
    percentage?: number
  }[]
}

export interface UpdateTravelExpenseDto {
  description?: string
  amount?: number
  expenseDate?: string
}
