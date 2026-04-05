import { useBudgetStore } from '@/stores/budget.store'
export const useCommon = () => {
  const budgetStore = useBudgetStore()

  const currentBudget = computed(() => budgetStore.currentBudgetPlan)
  const budgetStatus = computed(() => currentBudget.value?.status)

  return { currentBudget, budgetStatus }
}
