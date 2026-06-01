import { useBillsApi } from '@/composables/api/useBillsApi'
import type { Bill, CreateBillDto, ImportBillsDto, UpdateBillDto } from '~/types/bills.types'

export function useBillsApplication() {
  const api = useBillsApi()

  const {
    data: bills,
    refresh,
    pending: isLoading
  } = useAsyncData('bills', () => api.getAll().then(r => r.result as Bill[]))

  const activeBills = computed(() => (bills.value ?? []).filter(b => b.isActive))

  const createBill = async (dto: CreateBillDto) => {
    try {
      await api.create(dto)
      await refresh()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const updateBill = async (id: string, dto: UpdateBillDto) => {
    try {
      await api.update(id, dto)
      await refresh()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const toggleBill = async (id: string) => {
    try {
      await api.toggle(id)
      await refresh()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const deleteBill = async (id: string) => {
    try {
      await api.remove(id)
      await refresh()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const importBillsToBudget = async (budgetId: string, dto: ImportBillsDto) => {
    try {
      const res = await api.importToBudget(budgetId, dto)
      return { success: res.success, imported: res.result?.imported ?? 0 }
    } catch {
      return { success: false, imported: 0 }
    }
  }

  return {
    bills,
    activeBills,
    isLoading,
    refresh,
    createBill,
    updateBill,
    toggleBill,
    deleteBill,
    importBillsToBudget
  }
}
