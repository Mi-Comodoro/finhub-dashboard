import { usePlannedIncome } from '@/composables/usePlannedIncome'
import { getPercentage } from '@/utils/currency'
export const useSavingPlanned = () => {
  const { savingsAmount } = usePlannedIncome()
  const plannedSavingStore = usePlannedSavingStore()
  const { isLoading } = plannedSavingStore
  const markAsCompleted = async (itemId: string) => {
    const { success } = await plannedSavingStore.markAsCompleted(itemId)
    return success
  }
  const fetchByBudget = async (budgetId: string) => {
    await plannedSavingStore.fetchByBudget(budgetId)
  }
  const savingsPending = computed(() =>
    plannedSavingStore.items?.filter(item => item.status === 'pending')
  )

  const savingsCompleted = computed(() =>
    plannedSavingStore.items?.filter(item => item.status === 'completed')
  )

  const savingAmountCompleted = computed(() =>
    savingsCompleted.value?.reduce((acc, sa) => acc + Number(sa.amount), 0)
  )

  const savingProgress = computed(() =>
    getPercentage(savingsAmount.value, savingAmountCompleted.value ?? 0)
  )

  return {
    isLoading,
    savingsPending,
    savingsCompleted,
    savingAmountCompleted,
    savingProgress,
    savingsAmount,
    markAsCompleted,
    fetchByBudget
  }
}
