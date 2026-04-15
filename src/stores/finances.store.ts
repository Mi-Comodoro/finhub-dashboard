import { defineStore } from 'pinia'

import type { Currency } from '@/utils/currency'

// Financial Profile from API - this is what comes from backend
interface FinancialProfile {
  id: string
  profile: string
  usage: string // 'personal' | 'business' | 'family'
  currency: Currency
}

interface FinancialConfig {
  defaultCurrency: Currency
  budgetFrequency?: string // 'monthly' | 'weekly' | 'yearly'
}

export const useFinancesStore = defineStore('finances', {
  state: () => ({
    // Financial Profile from API
    profile: null as FinancialProfile | null,

    // Configuration
    config: null as FinancialConfig | null,

    // Loading states
    isLoadingProfile: false,

    // Last sync
    lastSyncAt: null as Date | null
  }),

  getters: {
    // Financial Profile
    financeId: state => state.profile?.id || '',

    financialProfile: state => state.profile?.profile || 'moderate',

    defaultCurrency: state => state.profile?.currency || state.config?.defaultCurrency || 'COP',

    financialUsage: state => state.profile?.usage || 'personal',

    // Status checks
    isProfileSetup: state => !!state.profile
  },

  actions: {
    // Financial Profile management
    setFinancialProfile(profile: FinancialProfile) {
      this.profile = profile
    },

    updateFinancialProfile(updates: Partial<FinancialProfile>) {
      if (this.profile) {
        this.profile = { ...this.profile, ...updates }
      }
    },

    // Configuration
    setConfig(config: FinancialConfig) {
      this.config = config
    },

    updateConfig(updates: Partial<FinancialConfig>) {
      if (this.config) {
        this.config = { ...this.config, ...updates }
      } else {
        // Create default config if none exists
        this.config = {
          defaultCurrency: this.profile?.currency || 'COP',
          ...updates
        }
      }
    },

    // Loading states
    setLoadingProfile(loading: boolean) {
      this.isLoadingProfile = loading
    },

    // Clear all data
    clearFinances() {
      this.profile = null
      this.config = null
      this.lastSyncAt = null
    },

    // Sync timestamp
    updateLastSync() {
      this.lastSyncAt = new Date()
    }
  }
})
