import { defineStore } from 'pinia'

import type { BetaAccessRequest, BetaAccessSummary } from '~/types/beta-access.types'

interface BetaAccessState {
  requests: BetaAccessRequest[]
  summary: BetaAccessSummary | null
  /** Email of the invitation the person arrived with (the token itself lives in a cookie) */
  invitedEmail: string | null
  isLoading: boolean
  error: string | null
}

export const useBetaAccessStore = defineStore('beta-access', {
  state: (): BetaAccessState => ({
    requests: [],
    summary: null,
    invitedEmail: null,
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

    setRequests(requests: BetaAccessRequest[]) {
      this.requests = requests
    },

    setSummary(summary: BetaAccessSummary | null) {
      this.summary = summary
    },

    setInvitedEmail(email: string | null) {
      this.invitedEmail = email
    }
  }
})
