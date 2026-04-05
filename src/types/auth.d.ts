// types/auth.ts

type AccountType = 'TRIAL' | 'FREE' | 'PREMIUM'
type OnboardingStatus = 'PENDING' | 'COMPLETED'
type AuthResponseData = {
  token: string
  accountType: AccountType
  expiresAt: number
  onboarding: OnboardingStatus
}
export interface RefreshResponse {
  token: string
  expiresAt: number
}
export interface AuthResponse {
  success: boolean
  data: AuthResponseData
}
export interface AuthResponseResult {
  success: boolean
  result: AuthResponseData
}
