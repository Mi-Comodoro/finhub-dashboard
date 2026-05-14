import type { FetchError } from 'ofetch'

import { useBudgetApi } from '@/composables/api/useBudgetApi'
import { useBudgetStore } from '@/stores/budget.store'
import type { BudgetListResponse, CurrentBudget, SingleBudget } from '~/types/api'
import type { Budget, CurrentBudgetPlan } from '~/types/domain'

// Business logic: mapear SingleBudget a Budget
const mapSingleBudgetToBudget = (single: SingleBudget): Budget => {
  return {
    id: single.id,
    userId: single.ownerId ?? '',
    period: {
      month: Number(single.month),
      year: Number(single.year)
    },
    frequency: single.frequency,
    status: single.status,
    allocations: [],
    strategy: single.strategy,
    isEditable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Business logic: manejo de errores
const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message:
        'Por seguridad, tu sesión ha caducado debido a la inactividad. Por favor, inicia sesión nuevamente para continuar.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message:
      ' Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
  }
}

// Business logic: mapear CurrentBudget a CurrentBudgetPlan
const mapCurrentBudgetToPlan = (result: SingleBudget): CurrentBudgetPlan => ({
  id: result.id,
  name: result.name,
  month: result.month,
  year: result.year,
  isShared: result.isShared,
  limits: result.limits,
  financesId: result.financesId,
  status: result.status,
  ownerId: result.ownerId,
  partnerId: result.partnerId,
  strategy: result.strategy,
  frequency: result.frequency,
  freeAmount: result.freeAmount
})

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
  const budgetApi = useBudgetApi()

  // Orchestration: fetch current budget
  const fetchCurrentBudget = async (financeId: string, month?: number, year?: number) => {
    try {
      if (!financeId) return

      budgetStore.setLoading(true)
      budgetStore.setError(null)

      const response = (await budgetApi.getCurrentBudget(
        financeId,
        month?.toString(),
        year?.toString()
      )) as CurrentBudget

      if (!response.success || !response.result) return

      budgetStore.setCurrentBudget(mapCurrentBudgetToPlan(response.result))
    } catch (err) {
      if ((err as FetchError).status === 404) {
        budgetStore.setCurrentBudget(null)
        budgetStore.setError(null)
        return
      }
      console.error('❌ Error fetching current budget:', err)
      budgetStore.setError(createErrorMessage(err as FetchError))
    } finally {
      budgetStore.setLoading(false)
    }
  }

  // Orchestration: fetch budgets list
  const fetchBudgets = async (financeId: string, year?: number) => {
    if (!financeId) return

    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const response = (await budgetApi.getBudgets(financeId, year)) as BudgetListResponse

      if (!response.success || !response.result) return

      budgetStore.setBudgetPlans(response.result.map(mapCurrentBudgetToPlan))
    } catch (err) {
      console.error('❌ Error fetching budgets:', err)
      budgetStore.setError(createErrorMessage(err as FetchError))
    } finally {
      budgetStore.setLoading(false)
    }
  }

  // Orchestration: fetch budget by ID
  const fetchBudgetById = async (budgetId: string) => {
    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const response = (await budgetApi.getBudgetById(budgetId)) as CurrentBudget

      if (!response.success || !response.result) return

      budgetStore.setBudgetSelected(mapCurrentBudgetToPlan(response.result))
    } catch (err) {
      console.error('❌ Error fetching budget by id:', err)
      budgetStore.setError(createErrorMessage(err as FetchError))
    } finally {
      budgetStore.setLoading(false)
    }
  }

  // Orchestration: enable budget
  const enableBudget = async (budgetId: string) => {
    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const response = (await budgetApi.enableBudget(budgetId)) as CurrentBudget

      if (!response.success || !response.result) return

      budgetStore.setCurrentBudget(response.result)
      const mappedBudget = mapSingleBudgetToBudget(response.result)
      budgetStore.updateBudget(mappedBudget)

      if (budgetStore.activeBudget?.id === budgetId) {
        budgetStore.setActiveBudget(mappedBudget)
      }
    } catch (err) {
      console.error('❌ Error enabling budget:', err)
      budgetStore.setError(createErrorMessage(err as FetchError))
    } finally {
      budgetStore.setLoading(false)
    }
  }

  const closeBudget = async (budgetId: string) => {
    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const response = (await budgetApi.closeBudget(budgetId)) as CurrentBudget

      if (!response.success || !response.result) return

      budgetStore.setCurrentBudget(response.result)
      const mappedBudget = mapSingleBudgetToBudget(response.result)
      budgetStore.updateBudget(mappedBudget)

      if (budgetStore.activeBudget?.id === budgetId) {
        budgetStore.setActiveBudget(mappedBudget)
      }
    } catch (err) {
      console.error('❌ Error closing budget:', err)
      budgetStore.setError(createErrorMessage(err as FetchError))
    } finally {
      budgetStore.setLoading(false)
    }
  }

  const handleCreate = async (data: CreateBudgetPayload) => {
    const { success, result } = await budgetApi.createBudget({
      ...data,
      mode: 'empty'
    })

    if (success && result) {
      budgetStore.addBudget(result)
    }

    return { success }
  }

  const handleClone = async (sourceBudgetId: string, month: number, year: number) => {
    const { success, result } = await budgetApi.cloneBudget(sourceBudgetId, month, year)

    if (success && result) {
      budgetStore.addBudget(result)
    }

    return { success }
  }

  const handleUpdate = async (id: string, data: UpdateBudgetPayload) => {
    const { success, result } = await budgetApi.updateBudget(id, { ...data })

    if (success && result) {
      const mappedBudget = mapSingleBudgetToBudget(result as SingleBudget)
      budgetStore.updateBudget(mappedBudget)
    }

    return { success }
  }

  const handleDelete = async (id: string) => {
    const { success } = await budgetApi.deleteBudget(id)

    if (success) {
      budgetStore.removeBudget(id)
    }

    return { success }
  }

  return {
    fetchCurrentBudget,
    fetchBudgets,
    fetchBudgetById,
    enableBudget,
    closeBudget,
    handleCreate,
    handleClone,
    handleUpdate,
    handleDelete
  }
}
