import type { AccountData } from '@/types/api'

export function useAccountApi() {

  const createAccount = async (data: Record<string, unknown>) =>
    $fetch<{ success: boolean; result: unknown }>(
      '/api/accounts/create',
      { method: 'POST', body: data }
    )

  const getAccounts = async () =>
    $fetch<{ success: boolean; result: AccountData[] }>(
      '/api/accounts/find',
      { method: 'GET' }
    )

  return {
    createAccount,
    getAccounts
  }
}
