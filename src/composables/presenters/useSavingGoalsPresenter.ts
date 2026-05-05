import { useGoalsStore } from '@/stores/goals.store'
import DateUtils from '@/utils/date'
export const useSavingGoalsPresenter = () => {
  const goalsStore = useGoalsStore()

  const sumAmountTarget = (limit: number) => {
    return goalsStore.goals.slice(0, limit).reduce((acc, goal) => acc + (goal.targetAmount ?? 0), 0)
  }

  const lastUpdate = () => {
    // 1. Validar si el arreglo tiene elementos para evitar errores
    if (goalsStore.goals.length === 0) return null

    const validGoals = goalsStore.goals.filter(g => g.updatedAt)
    if (validGoals.length === 0) return null

    const date = validGoals.reduce((max, obj) => {
      return new Date(obj.updatedAt!) > new Date(max.updatedAt!) ? obj : max
    }).updatedAt!

    return DateUtils.formatSmartDate(date)
  }

  return {
    sumAmountTarget,
    lastUpdate
  }
}
