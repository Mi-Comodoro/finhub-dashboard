import { defineStore } from 'pinia'

export interface SettingsData {
  currency: string
  language: string
  notificationsEnabled: boolean
  budgetAlertThreshold: number
  savingsPercentage: number
}

interface SettingsState {
  settings: SettingsData | null
  isLoading: boolean
  error: string | null
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: null,
    isLoading: false,
    error: null
  }),

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setSettings(settings: SettingsData) {
      this.settings = { ...settings }
      this.error = null
    },

    patchSettings(partial: Partial<SettingsData>) {
      if (this.settings) {
        this.settings = { ...this.settings, ...partial }
      }
      this.error = null
    }
  }
})
