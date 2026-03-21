import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import type { BudgetListResponse, CurrentBudget } from '~/types/api'

export const useBudget = () => {
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()

  const fetchCurrentBudget = async () => {
    const financeId = financesStore.profile?.id
    if (!financeId) return

    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const { success, result } = await $fetch<CurrentBudget>(`/api/budgets/${financeId}/current`)

      if (!success || !result) return

      budgetStore.setCurrentBudget({
        id: result.id,
        name: result.name,
        month: result.month,
        year: result.year,
        isShared: result.isShared,
        limits: result.limits,
        financesId: result.financesId,
        status: result.status,
        ownerId: result.ownerId,
        partnerId: result.partnerId,
        strategy: result.strategy,
        frequency: result.frequency
      })
    } catch (error) {
      console.error('❌ Error fetching current budget:', error)
      budgetStore.setError('Error al cargar el presupuesto actual')
    } finally {
      budgetStore.setLoading(false)
    }
  }

  const fetchBudgets = async (year?: number) => {
    const financeId = financesStore.profile?.id
    if (!financeId) return

    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const { success, result } = await $fetch<BudgetListResponse>(`/api/budgets/${financeId}`, {
        query: year !== undefined ? { year } : {}
      })

      if (!success || !result) return

      budgetStore.setBudgetPlans(
        result.map(item => ({
          id: item.id,
          name: item.name,
          month: item.month,
          year: item.year,
          isShared: item.isShared,
          status: item.status,
          limits: item.limits,
          ownerId: item.ownerId,
          financesId: item.financesId,
          partnerId: item.partnerId,
          strategy: item.strategy,
          frequency: item.frequency
        }))
      )
    } catch (error) {
      console.error('❌ Error fetching budgets:', error)
      budgetStore.setError('Error al cargar los presupuestos')
    } finally {
      budgetStore.setLoading(false)
    }
  }

  const fetchBudgetById = async (budgetId: string) => {
    budgetStore.setLoading(true)
    budgetStore.setError(null)

    try {
      const { success, result } = await $fetch<CurrentBudget>(`/api/budgets/plan/${budgetId}`)

      if (!success || !result) return

      budgetStore.setCurrentBudget({
        id: result.id,
        name: result.name,
        month: result.month,
        year: result.year,
        isShared: result.isShared,
        limits: result.limits,
        financesId: result.financesId,
        status: result.status,
        ownerId: result.ownerId,
        partnerId: result.partnerId,
        strategy: result.strategy,
        frequency: result.frequency
      })
    } catch (error) {
      console.error('❌ Error fetching current budget:', error)
      budgetStore.setError('Error al cargar el presupuesto actual')
    } finally {
      budgetStore.setLoading(false)
    }
  }

  return { fetchCurrentBudget, fetchBudgets, fetchBudgetById }
}
