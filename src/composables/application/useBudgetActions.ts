import { useBudgetApi } from '@/composables/api/budget.api'
import { useBudgetStore } from '@/stores/budget.store'

interface CreateBudgetPayload {
  name: string
  month: number
  year: number
  strategy: 'BALANCED' | 'CUSTOM'
  needsLimit: number
  wantsLimit: number
  savingsLimit: number
}

interface UpdateBudgetPayload {
  name: string
  strategy: 'BALANCED' | 'CUSTOM'
  needsLimit: number
  wantsLimit: number
  savingsLimit: number
}

export function useBudgetActions() {
  const budgetStore = useBudgetStore()
  const { createBudget, cloneBudget, updateBudget, deleteBudget } = useBudgetApi()

  const handleCreate = async (data: CreateBudgetPayload) => {
    const { success, result } = await createBudget({
      ...data,
      mode: 'empty'
    })

    if (success && result) {
      budgetStore.addBudget(result)
    }

    return { success }
  }

  const handleClone = async (sourceBudgetId: string, month: number, year: number) => {
    const { success, result } = await cloneBudget(sourceBudgetId, month, year)

    if (success && result) {
      budgetStore.addBudget(result)
    }

    return { success }
  }

  const handleUpdate = async (id: string, data: UpdateBudgetPayload) => {
    const { success, result } = await updateBudget(id, data)

    if (success && result) {
      budgetStore.updateBudget(result)
    }

    return { success }
  }

  const handleDelete = async (id: string) => {
    const { success } = await deleteBudget(id)

    if (success) {
      budgetStore.removeBudget(id)
    }

    return { success }
  }

  return {
    handleCreate,
    handleClone,
    handleUpdate,
    handleDelete
  }
}
