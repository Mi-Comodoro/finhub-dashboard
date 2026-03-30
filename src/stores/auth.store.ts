/**
 * Auth Store
 * Manages authentication state using domain models
 * Follows strict architectural rules - no API types, only domain models
 */

import { defineStore } from 'pinia'

import type { AccountType, AuthSession, AuthState, OnboardingStatus } from '~/types/domain'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    session: null,
    onboarding: null,
    accountType: null,
    isInitialized: false,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return state.session?.isAuthenticated ?? false
    },

    user: state => {
      return state.session?.user ?? null
    },

    isOnboardingCompleted: (state): boolean => {
      return state.onboarding?.isCompleted ?? false
    },

    isSessionExpired: (state): boolean => {
      if (!state.session) return true
      return state.session.sessionExpiresAt < new Date()
    }
  },

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setSession(session: AuthSession | null) {
      this.session = session

      // Clear error on successful session set
      if (session) {
        this.error = null
      }
    },

    setOnboarding(onboarding: OnboardingStatus | null) {
      this.onboarding = onboarding
    },
    // Helper method to check if user needs onboarding
    needsOnboarding(): boolean {
      return this.isAuthenticated && !this.isOnboardingCompleted
    },
    setAccountType(accountType: AccountType | null) {
      this.accountType = accountType
    },

    setInitialized(initialized: boolean) {
      this.isInitialized = initialized
    },

    clearAuth() {
      this.session = null
      this.onboarding = null
      this.accountType = null
      this.error = null
      // Keep isInitialized true to avoid re-initialization loops
    },

    async updateUserProfile(updates: Partial<AuthSession['user']>) {
      this.setLoading(true)
      this.setError(null)

      try {
        if (!this.session?.user) {
          throw new Error('No active session')
        }

        const updatedUser = {
          ...this.session.user,
          ...updates
        }

        const updatedSession: AuthSession = {
          ...this.session,
          user: updatedUser
        }

        this.setSession(updatedSession)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile'
        this.setError(message)
        throw err
      } finally {
        this.setLoading(false)
      }
    }
  }
})
