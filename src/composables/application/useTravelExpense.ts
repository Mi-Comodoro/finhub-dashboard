import type { FetchError } from 'ofetch'

import { useTravelExpenseApi } from '@/composables/api/useTravelExpenseApi'
import { useTravelExpenseStore } from '@/stores/travel-expense.store'
import type { CreateTravelExpenseDto, UpdateTravelExpenseDto } from '@/types/travel-expense.types'

const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message: 'Por seguridad, tu sesión ha caducado. Por favor, inicia sesión nuevamente.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message: 'Lo sentimos, no pudimos completar esta acción.'
  }
}

export const useTravelExpense = () => {
  const store = useTravelExpenseStore()
  const api = useTravelExpenseApi()

  const fetchByGroup = async (groupId: string) => {
    store.setLoading(true)
    store.setError(null)
    try {
      const { result } = await api.getByGroup(groupId)
      store.setExpenses(result)
      return { success: true }
    } catch (err) {
      store.setError(createErrorMessage(err as FetchError))
      return { success: false }
    } finally {
      store.setLoading(false)
    }
  }

  const createExpense = async (dto: CreateTravelExpenseDto) => {
    try {
      await api.createExpense(dto)
      await fetchByGroup(dto.groupId)
      return { success: true }
    } catch (err) {
      store.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const updateExpense = async (id: string, dto: UpdateTravelExpenseDto, groupId: string) => {
    try {
      await api.updateExpense(id, dto)
      await fetchByGroup(groupId)
      return { success: true }
    } catch (err) {
      store.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const deleteExpense = async (id: string, groupId: string) => {
    try {
      await api.deleteExpense(id)
      await fetchByGroup(groupId)
      return { success: true }
    } catch (err) {
      store.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const settleAssignment = async (expenseId: string, userId: string, groupId: string) => {
    try {
      await api.settleAssignment(expenseId, userId)
      await fetchByGroup(groupId)
      return { success: true }
    } catch (err) {
      store.setError(createErrorMessage(err as FetchError))
      return { success: false }
    }
  }

  const expenses = computed(() => store.expenses)
  const selectedExpense = computed(() => store.selectedExpense)
  const isLoading = computed(() => store.isLoading)
  const error = computed(() => store.error)

  return {
    expenses,
    selectedExpense,
    isLoading,
    error,
    fetchByGroup,
    createExpense,
    updateExpense,
    deleteExpense,
    settleAssignment
  }
}
