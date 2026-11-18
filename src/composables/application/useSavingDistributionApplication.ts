/**
 * Saving Distribution Application Layer
 * Coordinates business logic for saving distribution form
 */

import type { ComputedRef, Ref } from 'vue'

import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { useGoalsStore } from '@/stores/goals.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { useSavingAllocationsStore } from '@/stores/savingAllocations.store'

import { useActiveBudgetApplication } from './useActiveBudgetApplication'
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

export interface AllocationItem {
  goalId: string
  goalName: string
  percentage: number
}

export interface DistributionRow {
  goalId: string
  goalName: string
  percentage: number
}

/** Suggested split when the user has exactly three goals */
const SUGGESTED_SPLIT_THREE_GOALS = [40, 30, 30]

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

      await savingsAllocationsStore.fetchSavingAllocations(budgetId)
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
        .reduce((acc, sa) => acc + Number(sa.percentage ?? 0), 0)
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

  /**
   * Get per-goal allocation items for a budget (reactive, accepts a Ref)
   */
  const getAllocationItems = (budgetId: Ref<string | null>): ComputedRef<AllocationItem[]> => {
    return computed(() => {
      if (!budgetId.value) return []
      return savingsAllocationsStore.savingAllocations
        .filter(a => a.budgetId === budgetId.value)
        .map(a => ({
          goalId: a.goalId,
          goalName: goalsStore.goals.find(g => g.id === a.goalId)?.name ?? 'Meta desconocida',
          percentage: Number(a.percentage ?? 0)
        }))
    })
  }

  const updateDistribution = async (
    budgetId: string,
    distributions: Array<{ goalId: string; percentage: number }>
  ): Promise<{ success: boolean; error?: { title: string; message: string } | null }> => {
    await savingsAllocationsStore.replaceAllocations(budgetId, distributions)

    if (!savingsAllocationsStore.error) {
      return { success: true }
    } else {
      return { success: false, error: savingsAllocationsStore.error }
    }
  }

  /**
   * Monthly savings amount to distribute (from the active budget)
   */
  const { savingsAmount: monthlySavingsAmount } = useActiveBudgetApplication()

  /**
   * Rows for the distribution assistant: every active goal, prefilled with the current template
   */
  const buildDistributionRows = (budgetId: string): DistributionRow[] => {
    const current = savingsAllocationsStore.savingAllocations.filter(a => a.budgetId === budgetId)
    return goalsStore.goals
      .filter(g => g.isActive)
      .map(g => ({
        goalId: g.id,
        goalName: g.name,
        percentage: Number(current.find(a => a.goalId === g.id)?.percentage ?? 0)
      }))
  }

  /**
   * Equal split in integer percentages that always sums 100 (e.g. 3 goals -> 34, 33, 33)
   */
  const splitEvenly = (count: number): number[] => {
    if (count <= 0) return []
    const base = Math.floor(100 / count)
    const remainder = 100 - base * count
    return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0))
  }

  /**
   * Suggested 40/30/30 split, only available with exactly three goals
   */
  const getSuggestedSplit = (count: number): number[] | null =>
    count === SUGGESTED_SPLIT_THREE_GOALS.length ? [...SUGGESTED_SPLIT_THREE_GOALS] : null

  /**
   * Amount in money for a percentage of the monthly savings
   */
  const getAmountForPercentage = (percentage: number): number =>
    ((monthlySavingsAmount.value ?? 0) * (percentage || 0)) / 100

  /**
   * Replace the whole template with the rows of the assistant (0% rows are omitted)
   */
  const saveDistribution = async (budgetId: string, rows: DistributionRow[]) => {
    const total = rows.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0)
    if (Math.round(total * 100) !== 10000) {
      return { success: false, error: null }
    }
    const distributions = rows
      .filter(r => Number(r.percentage) > 0)
      .map(r => ({ goalId: r.goalId, percentage: Number(r.percentage) }))
    return updateDistribution(budgetId, distributions)
  }

  return {
    monthlySavingsAmount,
    buildDistributionRows,
    splitEvenly,
    getSuggestedSplit,
    getAmountForPercentage,
    saveDistribution,
    initialize,
    getSavingsAmount,
    getGoalOptions,
    getTotalAllocatedPercentage,
    getAllocationItems,
    submitAllocation,
    updateDistribution
  }
}
