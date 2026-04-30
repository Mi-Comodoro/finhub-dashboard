import type { Ref } from 'vue'

import type { GoalsData } from '@/types/api'
import { formatMonthsToGoal as formatMonths } from '@/utils/goal-formatters'

interface UseGoalDetailPresenterParams {
  goal: Ref<GoalsData | null>
  totalSavedForGoal: Ref<number>
  estimatedInterest: Ref<number>
  projectionMonthsToGoal: Ref<number | null>
  accountInterestRate: Ref<number>
}

export function useGoalDetailPresenter(params: UseGoalDetailPresenterParams) {
  const { goal, totalSavedForGoal, estimatedInterest, projectionMonthsToGoal, accountInterestRate } = params

  const totalDeposited = computed(() => totalSavedForGoal.value)

  const estimatedInterestValue = computed(() => estimatedInterest.value)

  const pendingAmount = computed(() => {
    const target = goal.value?.targetAmount ?? 0
    return Math.max(0, target - totalDeposited.value)
  })

  const progressPercentage = computed(() => {
    const target = goal.value?.targetAmount ?? 0
    if (target === 0) return 0
    return Math.min(100, Math.round((totalDeposited.value / target) * 100))
  })

  const estimatedTimeToGoal = computed(() => formatMonths(projectionMonthsToGoal.value))

  const interestRateLabel = computed(() => {
    const rate = accountInterestRate.value
    return rate > 0 ? `${rate}% EA` : 'Sin tasa definida'
  })

  return {
    totalDeposited,
    estimatedInterest: estimatedInterestValue,
    pendingAmount,
    progressPercentage,
    estimatedTimeToGoal,
    interestRateLabel
  }
}
