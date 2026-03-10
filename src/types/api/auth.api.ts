/**
 * API Types - Auth Module
 * External API contract representations
 * These match the actual REST API responses from NestJS backend
 */

export interface AuthApiResponse {
  readonly success: boolean
  readonly data: {
    readonly token: string
    readonly refreshToken: string
    readonly expiresAt: string
    readonly user: UserApiResponse
    readonly onboarding: OnboardingApiResponse
  }
}

export interface UserApiResponse {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly photoURL: string | null
  readonly emailVerified: boolean
  readonly accountType: string
  readonly createdAt: string // ISO string
  readonly lastLoginAt: string // ISO string
}

export interface OnboardingApiResponse {
  readonly isCompleted: boolean
  readonly currentStep: string
  readonly completedSteps: readonly string[]
}

export interface LoginApiRequest {
  readonly idToken: string // Firebase ID token
  readonly provider: 'google'
}

export interface RefreshTokenApiRequest {
  readonly refreshToken: string
}

export interface OnboardingUpdateApiRequest {
  readonly step: string
  readonly data: Record<string, unknown>
}

export interface LogoutApiResponse {
  readonly success: boolean
}
