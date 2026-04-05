import { useExpensesStore } from '@/stores/expense.store'

export const useExpense = () => {
  const store = useExpensesStore()
  const expenses = computed(() =>
    store.expenses
      .filter(expense => expense.bucket)
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )
  return { expenses }
}
