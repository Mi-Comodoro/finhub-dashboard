import { defineStore } from 'pinia'

import type { AccountReceivable, AccountReceivableSummary } from '~/types/accounts-receivable.types'

interface AccountsReceivableState {
  accounts: AccountReceivable[]
  summary: AccountReceivableSummary | null
  isLoading: boolean
  error: string | null
}

export const useAccountsReceivableStore = defineStore('accounts-receivable', {
  state: (): AccountsReceivableState => ({
    accounts: [],
    summary: null,
    isLoading: false,
    error: null
  }),

  getters: {},

  actions: {
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    setAccounts(accounts: AccountReceivable[]) {
      this.accounts = accounts
      this.error = null
    },
    setSummary(summary: AccountReceivableSummary | null) {
      this.summary = summary
    },
    clearData() {
      this.accounts = []
      this.summary = null
      this.error = null
    }
  }
})
