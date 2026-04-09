/* eslint-disable no-unused-vars */
// stores/useExpensesStore.ts

import { defineStore } from 'pinia'

import type { ExpenseData } from '~/types/domain'
type ExpenseStatus = 'PLANNED' | 'PAID' | 'CANCELED' | 'SKIPPED'
export const useExpensesStore = defineStore('expenses', () => {
  const expenses = ref<
    {
      id: string
      budgetId: string
      categoryId: string
      bucket: string
      name: string
      expectedAmount: number
      dueDate: Date | string
      status: ExpenseStatus
      isEssential: boolean
      notes?: string
      billsId?: string | null
      createdAt: Date | string
      updatedAt: Date | string
    }[]
  >([])
  const meta = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  })

  const filters = ref({
    budgetId: '',
    search: '',
    status: '',
    bucket: '',
    page: 1,
    limit: 10
  })

  const loading = ref(false)
  const error = ref('')
  const addExpensed = async (data: ExpenseData) => {
    loading.value = true
    const { success } = await $fetch<{
      success: boolean
      result: {
        id: string
        budgetId: string
        categoryId: string
        name: string
        expectedAmount: number
        dueDate: Date
        status: string
        isEssential: boolean
        notes: string
        billsId: string | null
        createdAt: Date
        updatedAt: Date
      }
    }>('/api/expenses', {
      method: 'POST',
      body: data
    })

    loading.value = false
    if (!success) {
      error.value = 'Error al crear gastos planificados'
    }
    await fetchExpenses()
    return success
  }
  // 🚀 Fetch principal
  const fetchExpenses = async () => {
    try {
      loading.value = true
      const activeFilters = Object.fromEntries(
        Object.entries(filters.value).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0 // Evita arrays vacíos []
          return value !== '' && value !== null && value !== undefined // Evita vacíos o nulos
        })
      )
      const { result } = await $fetch('/api/expenses/findAll', {
        method: 'GET',
        query: activeFilters
      })

      expenses.value = result.data
      meta.value = result.meta
    } catch (err) {
      console.error(err)
      error.value = 'Error cargando gastos'
    } finally {
      loading.value = false
    }
  }

  // 🔍 setters de filtros
  const setSearch = (value: string) => {
    filters.value.search = value
    filters.value.page = 1
  }

  const setStatus = (value: string) => {
    filters.value.status = value
    filters.value.page = 1
  }

  const setBucket = (value: string) => {
    filters.value.bucket = value
    filters.value.page = 1
  }

  const setPage = (page: number) => {
    filters.value.page = page
  }

  const setBudget = (budgetId: string) => {
    filters.value.budgetId = budgetId
  }
  const completeExpense = async (id: string) => {
    try {
      loading.value = true

      const { success, result } = await $fetch<{
        success: boolean
        result: {
          plannedExpense: { id: string; status: ExpenseStatus }
          transaction: { id: string; amount: number; type: string }
        }
      }>(`/api/expenses/${id}/complete`, {
        method: 'PATCH'
      })

      if (success && result) {
        const index = expenses.value.findIndex(e => e.id === id)
        if (index !== -1) {
          // ← solo mutar el campo status, no reemplazar el objeto
          expenses.value[index]!.status = result.plannedExpense.status
        }
      }

      return { success, result }
    } catch (err) {
      console.error(err)
      error.value = 'Error al marcar gasto como pagado'
      return { success: false, result: null }
    } finally {
      loading.value = false
    }
  }

  return {
    expenses,
    meta,
    filters,
    loading,
    error,
    addExpensed,
    fetchExpenses,
    setSearch,
    setStatus,
    setBucket,
    setPage,
    setBudget,
    completeExpense
  }
})
