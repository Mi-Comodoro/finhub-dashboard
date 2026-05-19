import type { Currency } from '@/utils/currency'

import type { AccountType } from '../domain'
export type BackendUserMe = {
  success: boolean
  data: {
    id: string
    email: string
    onboarding: string
    createdAt: Date
    role?: string
    userProfile: {
      type: AccountType
      name: string
      displayName: string
      photo: string
      phone: string
      gender: string
      trialEndsAt: Date
      isActive: boolean
      isPhoneVerified: boolean
      country: string
      role?: string
    }
    finances: {
      id: string
      profile: string
      usage: string
      currency: Currency
    }
  }
}

export type UserMe = {
  success: boolean
  result: {
    user: {
      id: string
      email: string
      name: string
      displayName: string
      photo?: string
      rejectPhoto?: boolean
      phone: string
      gender: string
      trialEndsAt?: Date
      isActive: boolean
      isPhoneVerified?: boolean
      country: string
      createdAt?: Date
      role?: string
    }
    finances: {
      id: string
      profile: string
      usage: string
      currency: Currency
    }
    onboarding: string
    accountType: AccountType
    expiresAt?: number | null
  }
}
