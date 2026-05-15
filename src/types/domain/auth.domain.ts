/**
 * Domain Types - Auth Module
 * Pure business logic representations for authentication
 * These types represent what the business cares about, not API responses
 */

export type UserRole = 'admin' | 'user'

export interface User {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly avatar: string | null
  readonly role?: UserRole
  /*   readonly emailVerified: boolean
  readonly createdAt: Date
  readonly lastLoginAt: Date */
}

export interface AuthSession {
  readonly user: User
  isAuthenticated: boolean
  readonly sessionExpiresAt: Date
}

export interface OnboardingStatus {
  isCompleted: boolean
}

export type OnboardingStep = 'personal-info' | 'finances-config' | 'budget-strategy' | 'completed'

export type AccountType = 'TRIAL' | 'FREE' | 'PREMIUM'

export interface AuthState {
  session: AuthSession | null
  onboarding: OnboardingStatus | null
  accountType: AccountType | null
  isInitialized: boolean
  isVerified: boolean
  isLoading: boolean
  error: string | null
}

// Auth actions/events
export interface LoginRequest {
  provider: 'google'
}

export interface OnboardingUpdateRequest {
  step: OnboardingStep
  data: Record<string, unknown>
}
