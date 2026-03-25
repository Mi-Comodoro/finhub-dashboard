import { useGoalsStore } from '@/stores/goals.store'
import DateUtils from '~/utils/date'
export const useSavingGoals = () => {
  const goalsStore = useGoalsStore()

  const sumAmountTarget = (limit: number) => {
    return goalsStore.goals
      .slice(0, limit)
      .reduce((acc, goal) => acc + Number(goal.targetAmount), 0)
  }

  const lastUpdate = () => {
    // 1. Validar si el arreglo tiene elementos para evitar errores
    if (goalsStore.goals.length === 0) return null

    const date = goalsStore.goals.reduce((max, obj) => {
      return new Date(obj.updatedAt as Date) > new Date(max.updatedAt as Date) ? obj : max
    }).updatedAt
    return DateUtils.formatSmartDate(date)
  }

  return {
    sumAmountTarget,
    lastUpdate
  }
}
