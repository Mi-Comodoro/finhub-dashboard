export type CompoundingFrequency = 'daily' | 'monthly' | 'annually'
export interface AccountData {
  id: string
  name: string
  description: string
  interestRate: number
  compoundingFrequency: CompoundingFrequency
  isActive: boolean
  userId: string
}
export interface AccountResponseApi {
  readonly success: boolean
  readonly data: AccountData[]
}
export interface AccountResponse {
  readonly success: boolean
  readonly result: AccountData[]
}

export interface AccountRateHistory {
  id: string
  accountId: string
  previousRate: number
  newRate: number
  changedAt: string
  createdAt: string
}
