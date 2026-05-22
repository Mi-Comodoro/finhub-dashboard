import type {
  AccountReceivable,
  AccountReceivableSummary,
  CreateAccountReceivableDto,
  RegisterCollectionDto
} from '~/types/accounts-receivable.types'

export function useAccountsReceivableApi() {
  const getAll = () => $fetch<{ success: boolean; result: AccountReceivable[] }>('/api/receivables')

  const getSummary = () =>
    $fetch<{ success: boolean; result: AccountReceivableSummary }>('/api/receivables/summary')

  const getById = (id: string) =>
    $fetch<{ success: boolean; result: AccountReceivable }>(`/api/receivables/${id}`)

  const create = (dto: CreateAccountReceivableDto) =>
    $fetch<{ success: boolean; result: AccountReceivable }>('/api/receivables', {
      method: 'POST',
      body: dto
    })

  const update = (id: string, dto: Partial<CreateAccountReceivableDto>) =>
    $fetch<{ success: boolean; result: AccountReceivable }>(`/api/receivables/${id}`, {
      method: 'PATCH',
      body: dto
    })

  const remove = (id: string) =>
    $fetch<{ success: boolean }>(`/api/receivables/${id}`, { method: 'DELETE' })

  const registerCollection = (id: string, dto: RegisterCollectionDto) =>
    $fetch<{ success: boolean; result: unknown }>(`/api/receivables/${id}/collections`, {
      method: 'POST',
      body: dto
    })

  return { getAll, getById, getSummary, create, update, remove, registerCollection }
}
