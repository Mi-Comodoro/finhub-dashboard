import { usePlannedSavingStore } from '@/stores/planned-saving.store'

export function usePlannedSavingApplication() {
  const plannedSavingStore = usePlannedSavingStore()

  const fetchByBudget = async (budgetId: string) => {
    await plannedSavingStore.fetchByBudget(budgetId)
    return { success: !plannedSavingStore.error }
  }

  const markAsCompleted = async (itemId: string) => {
    const { success } = await plannedSavingStore.markAsCompleted(itemId)

    // Refresh transactions after marking as completed
    if (success && plannedSavingStore.budgetId) {
      const { useTransactionApplication } = await import('./useTransactionApplication')
      const { fetchByBudget } = useTransactionApplication()

      await fetchByBudget(plannedSavingStore.budgetId)
    }

    return { success }
  }

  const assignGoal = async (itemId: string, savingGoalId: string) => {
    return await plannedSavingStore.assignGoal(itemId, savingGoalId)
  }

  const isLoading = computed(() => plannedSavingStore.isLoading)
  const items = computed(() => plannedSavingStore.items)
  const pendingItems = computed(() => plannedSavingStore.pendingItems)
  const completedItems = computed(() => plannedSavingStore.completedItems)
  const totalSavingGenerated = computed(() => plannedSavingStore.totalSavingGenerated)
  const totalSavingPending = computed(() => plannedSavingStore.totalSavingPending)
  const error = computed(() => plannedSavingStore.error)

  return {
    fetchByBudget,
    markAsCompleted,
    assignGoal,
    isLoading,
    items,
    pendingItems,
    completedItems,
    totalSavingGenerated,
    totalSavingPending,
    error
  }
}
