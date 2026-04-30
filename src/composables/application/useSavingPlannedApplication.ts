import { usePlannedIncomeApplication } from '@/composables/application/usePlannedIncomeApplication'
import { usePlannedSavingApplication } from '@/composables/application/usePlannedSavingApplication'
import { getPercentage } from '@/utils/currency'

export const useSavingPlannedApplication = () => {
  const { savingsAmount } = usePlannedIncomeApplication()
  const {
    isLoading,
    pendingItems,
    completedItems,
    fetchByBudget: appFetchByBudget,
    markAsCompleted: appMarkAsCompleted
  } = usePlannedSavingApplication()

  const markAsCompleted = async (itemId: string) => {
    const { success } = await appMarkAsCompleted(itemId)
    return success
  }

  const fetchByBudget = async (budgetId: string) => {
    await appFetchByBudget(budgetId)
  }

  const savingsPending = computed(() => pendingItems.value)
  const savingsCompleted = computed(() => completedItems.value)

  const savingAmountCompleted = computed(() =>
    savingsCompleted.value?.reduce((acc, sa) => acc + (sa.amount ?? 0), 0)
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
