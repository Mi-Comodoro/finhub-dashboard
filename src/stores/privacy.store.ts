import { defineStore } from 'pinia'

import type { DeletionStatus } from '@/composables/api/usePrivacyApi'

interface PrivacyState {
  deletion: DeletionStatus | null
  isLoading: boolean
}

export const usePrivacyStore = defineStore('privacy', {
  state: (): PrivacyState => ({
    deletion: null,
    isLoading: false
  }),

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setDeletion(deletion: DeletionStatus | null) {
      this.deletion = deletion
    }
  }
})
