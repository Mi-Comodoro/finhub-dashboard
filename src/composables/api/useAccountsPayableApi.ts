import type {
  AccountPayable,
  AccountPayableSummary,
  CreateAccountPayableDto,
  RegisterPaymentDto
} from '~/types/accounts-payable.types'

export function useAccountsPayableApi() {
  const getAll = () =>
    $fetch<{ success: boolean; result: AccountPayable[] }>('/api/accounts-payable')

  const getSummary = () =>
    $fetch<{ success: boolean; result: AccountPayableSummary }>('/api/accounts-payable/summary')

  const create = (dto: CreateAccountPayableDto) =>
    $fetch<{ success: boolean; result: AccountPayable }>('/api/accounts-payable', {
      method: 'POST',
      body: dto
    })

  const update = (id: string, dto: Partial<CreateAccountPayableDto>) =>
    $fetch<{ success: boolean; result: AccountPayable }>(`/api/accounts-payable/${id}`, {
      method: 'PATCH',
      body: dto
    })

  const remove = (id: string) =>
    $fetch<{ success: boolean; result: { id: string } }>(`/api/accounts-payable/${id}`, {
      method: 'DELETE'
    })

  const registerPayment = (id: string, dto: RegisterPaymentDto) =>
    $fetch<{ success: boolean; result: AccountPayable }>(`/api/accounts-payable/${id}/payments`, {
      method: 'POST',
      body: dto
    })

  return { getAll, getSummary, create, update, remove, registerPayment }
}
