import type { AccountData, AccountRateHistory } from '@/types/api'

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

  const updateAccount = async (
    id: string,
    data: Partial<Omit<AccountData, 'id' | 'userId'>>
  ) =>
    $fetch<{ success: boolean; result: AccountData }>(
      `/api/accounts/${id}`,
      { method: 'PATCH', body: data }
    )

  const fetchRateHistory = async (
    accountId: string
  ): Promise<AccountRateHistory[]> => {
    const response = await $fetch<{
      success: boolean
      result: AccountRateHistory[]
    }>(`/api/accounts/${accountId}/rate-history`)

    return response.result ?? []
  }

  return {
    createAccount,
    getAccounts,
    updateAccount,
    fetchRateHistory
  }
}
