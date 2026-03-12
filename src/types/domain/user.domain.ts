/**
 * Domain Types - User Module
 * User profile and preferences
 */

import type { Currency } from '@/utils/currency'

export interface UserProfile {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly photoURL: string | null
  readonly preferences: UserPreferences
  readonly financialSpace: FinancialSpace
  readonly subscription: SubscriptionPlan | null
}

export interface UserPreferences {
  readonly currency: Currency
  readonly locale: string
  readonly timezone: string
  readonly theme: 'dark' | 'light'
  readonly notifications: NotificationSettings
}

export interface FinancialSpace {
  readonly id: string
  readonly name: string
  readonly createdAt: Date
  readonly isActive: boolean
  // Only one space per user in MVP
}

export interface NotificationSettings {
  readonly budgetAlerts: boolean
  readonly overBudgetWarnings: boolean
  readonly monthlyReports: boolean
  readonly emailNotifications: boolean
}

export type SubscriptionPlan = 'free' | 'premium' | 'enterprise'
