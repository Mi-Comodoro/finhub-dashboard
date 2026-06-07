import type { Bill, CreateBillDto, ImportBillsDto, UpdateBillDto } from '~/types/bills.types'

export function useBillsApi() {
  const getAll = () => $fetch<{ success: boolean; result: Bill[] }>('/api/bills')

  const create = (dto: CreateBillDto) =>
    $fetch<{ success: boolean; result: Bill }>('/api/bills', {
      method: 'POST',
      body: dto
    })

  const update = (id: string, dto: UpdateBillDto) =>
    $fetch<{ success: boolean; result: Bill }>(`/api/bills/${id}`, {
      method: 'PATCH',
      body: dto
    })

  const toggle = (id: string) =>
    $fetch<{ success: boolean; result: Bill }>(`/api/bills/${id}/toggle`, {
      method: 'PATCH'
    })

  const remove = (id: string) =>
    $fetch<{ success: boolean }>(`/api/bills/${id}`, {
      method: 'DELETE'
    })

  const importToBudget = (budgetId: string, dto: ImportBillsDto) =>
    $fetch<{ success: boolean; result: { imported: number } }>(`/api/bills/import/${budgetId}`, {
      method: 'POST',
      body: dto
    })

  return { getAll, create, update, toggle, remove, importToBudget }
}
