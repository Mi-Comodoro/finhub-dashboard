/**
 * Saving Distribution Application Layer
 * Coordinates business logic for saving distribution form
 */

import type { ComputedRef } from 'vue'

import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useGoalsStore } from '@/stores/goals.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'

import { usePlannedIncomeApplication } from './usePlannedIncomeApplication'

interface SavingDistributionFormData {
  percentage: number
  goalId: string
}

interface GoalOption {
  label: string
  value: string
  disabled: boolean
}

export function useSavingDistributionApplication() {
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const { fetchPlannedIncomeByBudgetId: loadPlannedIncomes } = usePlannedIncomeApplication()
  const plannedIncomeStore = usePlannedIncomeStore()
  const goalsStore = useGoalsStore()
  const savingsAllocationsStore = useSavingAllocationsStore()

  /**
   * Initialize data required for the form
   */
  const initialize = async (): Promise<{ budgetId: string | null }> => {
    const { useBudgetActions } = await import('./useBudgetActions')
    const { fetchCurrentBudget } = useBudgetActions()
    await fetchCurrentBudget(financesStore.financeId)
    const budgetId = budgetStore?.currentBudgetPlan?.id ?? null

    if (budgetId) {
      await loadPlannedIncomes(budgetId)

      if (savingsAllocationsStore.savingAllocations.length < 1) {
        await savingsAllocationsStore.fetchSavingAllocations(budgetId)
      }
    }

    return { budgetId }
  }

  /**
   * Get savings amount from planned income
   * Uses usePlannedIncome to compute buckets
   */
  const getSavingsAmount = (): ComputedRef<number> => {
    const budgetStore = useBudgetStore()

    return computed(() => {
      const limits = budgetStore.currentBudgetPlan?.limits
      const expected = plannedIncomeStore.expectedIncome
      const savingsPercentage = limits?.savings ?? 0
      return (expected * savingsPercentage) / 100
    })
  }

  /**
   * Get formatted goals for select options
   */
  const getGoalOptions = (): ComputedRef<GoalOption[]> => {
    return computed(() =>
      goalsStore.goals.map(item => ({
        label: item.name,
        value: item.id!,
        disabled: !item.isActive
      }))
    )
  }

  /**
   * Get total allocated percentage for a specific budget
   */
  const getTotalAllocatedPercentage = (budgetId: string): ComputedRef<number> => {
    return computed(() =>
      savingsAllocationsStore.savingAllocations
        .filter(a => a.budgetId === budgetId)
        .reduce((acc, sa) => acc + (sa.percentage ?? 0), 0)
    )
  }

  /**
   * Submit saving distribution allocation
   */
  const submitAllocation = async (
    formData: SavingDistributionFormData,
    budgetId: string
  ): Promise<{ success: boolean; error?: { title: string; message: string } | null }> => {
    const buildData = {
      goalId: formData.goalId,
      percentage: formData.percentage,
      budgetId
    }

    await savingsAllocationsStore.addSavingAllocation(buildData)

    if (!savingsAllocationsStore.error) {
      return { success: true }
    } else {
      return { success: false, error: savingsAllocationsStore.error }
    }
  }

  return {
    initialize,
    getSavingsAmount,
    getGoalOptions,
    getTotalAllocatedPercentage,
    submitAllocation
  }
}
