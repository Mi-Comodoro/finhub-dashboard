import { useExpenseApplication } from '@/composables/application/useExpenseApplication'
import { useExpensesStore } from '@/stores/expense.store'

export function useExpenseSectionApplication() {
  const expenseStore = useExpensesStore()
  const { fetchExpenses: fetchExpensesApp } = useExpenseApplication()

  const setBudget = (budgetId: string) => {
    expenseStore.setBudget(budgetId)
  }

  const fetchExpenses = async () => {
    await fetchExpensesApp()
    return { success: !expenseStore.error }
  }

  const setSearch = (search: string) => {
    expenseStore.setSearch(search)
  }

  const setBucket = (bucket: string) => {
    expenseStore.setBucket(bucket)
  }

  const setPage = (page: number) => {
    expenseStore.setPage(page)
  }

  const expenses = computed(() => expenseStore.expenses)
  const filters = computed(() => expenseStore.filters)
  const meta = computed(() => expenseStore.meta)
  const isLoading = computed(() => expenseStore.loading)
  const error = computed(() => expenseStore.error)

  return {
    setBudget,
    fetchExpenses,
    setSearch,
    setBucket,
    setPage,
    expenses,
    filters,
    meta,
    isLoading,
    error
  }
}
