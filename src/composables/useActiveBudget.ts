import { useAccountStore } from '@/stores/account.store'
import { useBudgetStore } from '@/stores/budget.store'
import { useGoalsStore } from '@/stores/goals.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'
import { subtractPercentage } from '@/utils/numbers'
export const useActiveBudget = () => {
  const accountStore = useAccountStore()
  const goalsStore = useGoalsStore()
  const savingsAllocationsStore = useSavingAllocationsStore()
  const plannedIncomeStore = usePlannedIncomeStore()
  const budgetStore = useBudgetStore()
  const savingsAmount = computed(() => plannedIncomeStore.buckets.savingsAmount)
  const isAccountCreated = computed(() => accountStore.accounts.length >= 1)
  const goalsProgress = computed(() => goalsStore.goals.length)
  const isGoalsCompleted = computed(() => goalsProgress.value >= 3)
  const allocationProgress = computed(() =>
    savingsAllocationsStore.savingAllocations.reduce((acc, sa) => acc + Number(sa.percentage), 0)
  )
  const pendingAllocationProgress = computed(() => 100 - allocationProgress.value)
  const isSavingsAllocationCompleted = computed(() => allocationProgress.value === 100)

  const pendingAssignedAmount = computed(() =>
    savingsAllocationsStore.savingAllocations.length === 0
      ? savingsAmount.value
      : subtractPercentage(savingsAmount.value, allocationProgress.value)
  )

  const canActive = () => {
    return isAccountCreated.value && isGoalsCompleted.value && isSavingsAllocationCompleted.value
  }
  const enabled = async () => {
    const budgetId = budgetStore.currentBudgetPlan
      ? (budgetStore.currentBudgetPlan.id as string)
      : ''
    await budgetStore.enableBudget(budgetId)
  }

  return {
    isAccountCreated,
    isGoalsCompleted,
    isSavingsAllocationCompleted,
    pendingAllocationProgress,
    allocationProgress,
    goalsProgress,
    pendingAssignedAmount,
    savingsAmount,
    enabled,
    canActive
  }
}
