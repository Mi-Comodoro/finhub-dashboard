import { useExpensesStore } from '@/stores/expense.store'
import type { ExpenseData } from '@/types/domain/'
export const useExpense = () => {
  const error = ref('')
  const isLoading = ref(false)
  const store = useExpensesStore()
  const addExpensed = async (data: ExpenseData) => {
    isLoading.value = true
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

    isLoading.value = false
    if (!success) {
      error.value = 'Error al crear gastos planificados'
    }
    await store.fetchExpenses()
    return success
  }
  return { addExpensed, error, isLoading }
}
