import type { Ref } from 'vue'

import type { GoalsData } from '@/types/api'
import { formatMonthsToGoal as formatMonths } from '@/utils/goal-formatters'

interface UseGoalDetailPresenterParams {
  goal: Ref<GoalsData | null>
  /** Sum of savings deposits only (excludes registered interest) */
  principalSaved: Ref<number>
  /** principalSaved + registered interest — used for progress and pending calculation */
  totalSavedForGoal: Ref<number>
  estimatedInterest: Ref<number>
  projectionMonthsToGoal: Ref<number | null>
  accountInterestRate: Ref<number>
}

export function useGoalDetailPresenter(params: UseGoalDetailPresenterParams) {
  const {
    goal,
    principalSaved,
    totalSavedForGoal,
    estimatedInterest,
    projectionMonthsToGoal,
    accountInterestRate
  } = params

  const totalDeposited = computed(() => principalSaved.value)

  const estimatedInterestValue = computed(() => estimatedInterest.value)

  const pendingAmount = computed(() => {
    const target = goal.value?.targetAmount ?? 0
    return Math.max(0, target - totalSavedForGoal.value)
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
    estimatedTimeToGoal,
    interestRateLabel
  }
}
