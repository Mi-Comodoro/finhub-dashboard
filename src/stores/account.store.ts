import { defineStore } from 'pinia'

import { useAccountApi } from '@/composables/api/useAccountApi'
import type { AccountData } from '@/types/api'

export const useAccountStore = defineStore('accounts', () => {
  const loading = ref(false)
  const error = ref('')
  const accounts = ref<AccountData[]>([])
  const fetchAccounts = async () => {
    const { getAccounts } = useAccountApi()
    try {
      loading.value = true
      const { result } = await getAccounts()
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
