export interface GoalsData {
  id?: string
  name: string
  reason: string
  targetAmount: number
  targetDate: Date
  isActive: boolean
  accountId: string
  userId: string
  accountName: string
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
