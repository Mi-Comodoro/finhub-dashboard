/**
 * Settings Store
 * Manages application settings state
 * Follows strict architectural rules - no API calls, only state management
 */

import { defineStore } from 'pinia'

export interface NotificationSettings {
  emailNotifications: boolean
  budgetAlerts: boolean
  savingsReminders: boolean
  transactionUpdates: boolean
}

export interface BudgetDefaults {
  strategy: 'BALANCED' | 'CUSTOM'
  needsPercentage: number
  wantsPercentage: number
  savingsPercentage: number
}

export interface SettingsState {
  notifications: NotificationSettings
  budgetDefaults: BudgetDefaults
  currency: string
  isLoading: boolean
  error: string | null
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    notifications: {
      emailNotifications: true,
      budgetAlerts: true,
      savingsReminders: true,
      transactionUpdates: false
    },
    budgetDefaults: {
      strategy: 'BALANCED',
      needsPercentage: 50,
      wantsPercentage: 30,
      savingsPercentage: 20
    },
    currency: 'USD',
    isLoading: false,
    error: null
  }),

  getters: {
    hasNotificationsEnabled: (state) =>
      state.notifications.emailNotifications ||
      state.notifications.budgetAlerts ||
      state.notifications.savingsReminders ||
      state.notifications.transactionUpdates,

    isBalancedStrategy: (state) => state.budgetDefaults.strategy === 'BALANCED',

    totalPercentage: (state) =>
      state.budgetDefaults.needsPercentage +
      state.budgetDefaults.wantsPercentage +
      state.budgetDefaults.savingsPercentage
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setNotifications(notifications: NotificationSettings) {
      this.notifications = { ...notifications }
      this.error = null
    },

    setBudgetDefaults(budgetDefaults: BudgetDefaults) {
      this.budgetDefaults = { ...budgetDefaults }
      this.error = null
    },

    setCurrency(currency: string) {
      this.currency = currency
      this.error = null
    },

    setSettings(settings: Partial<SettingsState>) {
      if (settings.notifications) {
        this.notifications = { ...this.notifications, ...settings.notifications }
      }
      if (settings.budgetDefaults) {
        this.budgetDefaults = { ...this.budgetDefaults, ...settings.budgetDefaults }
      }
      if (settings.currency) {
        this.currency = settings.currency
      }
      this.error = null
    },

    clearError() {
      this.error = null
    }
  }
})
