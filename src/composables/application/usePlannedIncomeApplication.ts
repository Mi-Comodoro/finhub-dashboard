import type { FetchError } from 'ofetch'

import { useIncomeApi } from '@/composables/api/useIncomeApi'
import { useBudgetStore } from '@/stores/budget.store'
import { useFinancesStore } from '@/stores/finances.store'
import { usePlannedIncomeStore } from '@/stores/planned-income.store'
import { percentOf } from '@/utils/currency'
import { translate } from '@/utils/translateToUI'
import type { PlannedIncomeSummary, PlannedSavingSummary } from '~/types/domain'

const mapSource = (source: string) => {
  return translate[source]
}

// Business logic: calcular total de ingresos planificados
const calculateExpectedAmount = (incomes: PlannedIncomeSummary[]) => {
  return incomes.reduce((acc, b) => acc + (b.amount ?? 0), 0)
}

// Business logic: actualizar un ingreso en el summary
const updateIncomeSummary = (
  summary: PlannedIncomeSummary[],
  updatedIncome: PlannedIncomeSummary
) => {
  return summary.map(item => (item.id === updatedIncome.id ? { ...item, ...updatedIncome } : item))
}

// Business logic: manejo de errores
const createErrorMessage = (error: FetchError) => {
  if (error.status === 401) {
    return {
      status: error.status,
      title: 'Tu sesión ha expirado.',
      message:
        'Por seguridad, tu sesión ha caducado debido a la inactividad. Por favor, inicia sesión nuevamente para continuar.'
    }
  }
  return {
    title: '¡Ups! Algo no salió como esperábamos',
    message:
      'Lo sentimos, no pudimos completar esta acción. Si el problema persiste, contacta con nuestro equipo de soporte.'
  }
}

/**
 * Composable for planned income application logic
 * Orchestrates API calls, business logic, and store updates
 */
export function usePlannedIncomeApplication() {
  const store = usePlannedIncomeStore()
  const budgetStore = useBudgetStore()
  const financesStore = useFinancesStore()
  const incomeApi = useIncomeApi()

  const summary = computed(() => store.summary)
  const sources = computed(() => summary.value?.map(item => mapSource(item.source)))
  const lastUpdate = computed(() => summary.value?.find(i => i.updatedAt)?.updatedAt)
  const expectedAmount = computed(() => store.expectedIncome)
  const error = computed(() => store.error)

  // Compute buckets based on budget limits and expected income
  const buckets = computed(() => {
    const limits = budgetStore.currentBudgetPlan?.limits
    const expected = store.expectedIncome
    const currency = financesStore.defaultCurrency

    return {
      needsAmount: percentOf(expected, limits?.needs ?? 0, currency),
      wantsAmount: percentOf(expected, limits?.wants ?? 0, currency),
      savingsAmount: percentOf(expected, limits?.savings ?? 0, currency)
    }
  })

  const needsAmount = computed(() => buckets.value.needsAmount)
  const wantsAmount = computed(() => buckets.value.wantsAmount)
  const savingsAmount = computed(() => buckets.value.savingsAmount)
  const processingIncomeId = computed(() => store.processingIncomeId)

  // Orchestration: fetch planned incomes by budget
  const fetchPlannedIncomeByBudgetId = async (budgetId: string) => {
    try {
      store.setLoading(true)

      const { success, result } = await incomeApi.getPlannedIncomesByBudget(budgetId)

      if (success && result) {
        store.setSummary(result)
        store.setBudgetId(budgetId)
        const expectedIncome = calculateExpectedAmount(result)
        store.setExpectedIncome(expectedIncome)
      }

      return { success, result }
    } catch (err) {
      const errorMsg = createErrorMessage(err as FetchError)
      store.setError(errorMsg)
      return { success: false, result: null }
    } finally {
      store.setLoading(false)
    }
  }

  // Orchestration: fetch all planned incomes
  const fetchPlannedIncome = async () => {
    try {
      store.setLoading(true)
      const { success, result } = await incomeApi.getPlannedIncomes()
      return { success, result }
    } catch (err) {
      const errorMsg = createErrorMessage(err as FetchError)
      store.setError(errorMsg)
      return { success: false, result: null }
    } finally {
      store.setLoading(false)
    }
  }

  // Orchestration: mark income as received
  const markAsReceived = async (id: string) => {
    try {
      store.setError(null)
      store.setProcessingIncomeId(id)

      const { success, result } = await incomeApi.markPlannedIncomeAsReceived(id)

      if (success && result?.plannedIncome && store.summary) {
        // 1. Actualizar summary local
        const updatedSummary = updateIncomeSummary(store.summary, result.plannedIncome)
        store.setSummary(updatedSummary)
        const expectedIncome = calculateExpectedAmount(updatedSummary)
        store.setExpectedIncome(expectedIncome)

        // 2. Refrescar planned savings con los nuevos generados
        if (store.budgetId) {
          const { usePlannedSavingApplication } = await import('./usePlannedSavingApplication')
          const { fetchByBudget } = usePlannedSavingApplication()
          await fetchByBudget(store.budgetId)
        }

        // 3. Refrescar transacciones
        if (store.budgetId) {
          const { useTransactionApplication } = await import('./useTransactionApplication')
          const { fetchByBudget } = useTransactionApplication()
          await fetchByBudget(store.budgetId)
        }
      }

      return { success, result }
    } catch (err) {
      const errorMsg = createErrorMessage(err as FetchError)
      store.setError(errorMsg)
      return {
        success: false,
        result: null as {
          plannedIncome: PlannedIncomeSummary
          plannedSavings: PlannedSavingSummary[]
        } | null
      }
    } finally {
      store.setProcessingIncomeId(null)
    }
  }

  return {
    error,
    sources,
    lastUpdate,
    buckets,
    expectedAmount,
    needsAmount,
    wantsAmount,
    savingsAmount,
    summary,
    processingIncomeId,
    markAsReceived,
    fetchPlannedIncomeByBudgetId,
    fetchPlannedIncome
  }
}
