import type { PlannedSaving } from './planned-savings.api'

export type GoalStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'

export interface GoalsData {
  id: string
  name: string
  reason: string
  targetAmount?: number | null
  targetDate?: Date | null
  isActive: boolean
  accountId: string
  userId?: string
  accountName?: string
  status?: GoalStatus
  /**
   * Populated only when fetched via GET /goals/:id
   * Not present in GET /goals list response
   */
  plannedSavings?: PlannedSaving[]
  /** Sum of completed PlannedSavings — populated in GET /goals list */
  totalSaved?: number
  lastInterestDate?: Date | null
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
