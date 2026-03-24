import { defineStore } from 'pinia'

import type { AccountData, AccountResponse } from '@/types/api'

export const useAccountStore = defineStore('accounts', () => {
  const loading = ref(false)
  const error = ref('')
  const accounts = ref<AccountData[]>([])
  const fetchAccounts = async () => {
    try {
      loading.value = true
      const { result } = await $fetch<AccountResponse>('/api/accounts/find', {
        method: 'GET'
      })
      accounts.value = result
    } catch (err) {
      console.error(err)
      error.value = 'Error cargando cuentas'
    } finally {
      loading.value = false
    }
  }
  return { accounts, fetchAccounts, loading, error }
})
