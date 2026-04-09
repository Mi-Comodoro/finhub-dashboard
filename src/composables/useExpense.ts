import { useExpensesStore } from '@/stores/expense.store'
import { getPercentage } from '@/utils/currency'
export const useExpense = () => {
  const { needsAmount, wantsAmount } = usePlannedIncome()
  const store = useExpensesStore()

  const expenses = computed(() =>
    store.expenses
      .filter(expense => expense.bucket)
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const needsAmountCompleted = computed(() =>
    store.expenses
      .filter(item => item.status === 'PAID' && item.bucket === 'needs')
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const wantsAmountCompleted = computed(() =>
    store.expenses
      .filter(item => item.status === 'PAID' && item.bucket === 'wants')
      .reduce((acc, expense) => acc + Number(expense.expectedAmount), 0)
  )

  const wantsProgress = computed(() =>
    getPercentage(needsAmount.value, wantsAmountCompleted.value ?? 0)
  )
  const needsProgress = computed(() =>
    getPercentage(needsAmount.value, needsAmountCompleted.value ?? 0)
  )

  return { expenses, needsProgress, wantsProgress, needsAmount, wantsAmount }
}
