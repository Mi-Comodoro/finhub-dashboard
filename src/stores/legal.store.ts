import { defineStore } from 'pinia'

interface LegalState {
  policyVersion: string
  consentRequired: boolean
  needsAcceptance: boolean
  isLoading: boolean
}

export const useLegalStore = defineStore('legal', {
  state: (): LegalState => ({
    policyVersion: '',
    consentRequired: false,
    needsAcceptance: false,
    isLoading: false
  }),

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setVersions(versions: { policyVersion: string; consentRequired: boolean }) {
      this.policyVersion = versions.policyVersion
      this.consentRequired = versions.consentRequired
    },

    setNeedsAcceptance(needsAcceptance: boolean) {
      this.needsAcceptance = needsAcceptance
    }
  }
})
