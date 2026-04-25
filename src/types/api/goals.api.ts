export type GoalStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'

export interface GoalsData {
  id?: string
  name: string
  reason: string
  targetAmount?: number | null
  targetDate?: Date | null
  isActive: boolean
  accountId: string
  userId?: string
  accountName?: string
  status?: GoalStatus
  createdAt?: Date
  updatedAt?: Date
}
export interface GoalsResponseApi {
  success: boolean
  data: GoalsData[]
}
export interface GoalsResponseList {
  success: boolean
  result: GoalsData[]
}

export interface GoalHistory {
  id: string
  goalId: string
  field: string
  oldValue: string | null
  newValue: string
  changedAt: string
}
