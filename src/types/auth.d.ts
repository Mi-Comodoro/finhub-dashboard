// types/auth.ts

type AccountType = 'TRIAL' | 'FREE' | 'PLUS' | 'PRO' | 'PARTNER'
type OnboardingStatus = 'PENDING' | 'COMPLETED'
type AuthResponseData = {
  token: string
  refreshToken: string
  accountType: AccountType
  expiresAt: number
  onboarding: OnboardingStatus
}
export interface RefreshResponse {
  token: string
  refreshToken: string
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
