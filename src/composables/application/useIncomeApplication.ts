import { storeToRefs } from 'pinia'

import { useIncomeApi } from '~/composables/api/useIncomeApi'
import { useIncomeStore } from '~/stores/income.store'
import type { Income } from '~/types/domain'

export const useIncomeApplication = () => {
  const incomeStore = useIncomeStore()
  const { expectedIncomes, summary, isLoading, error } = storeToRefs(incomeStore)
  const incomeApi = useIncomeApi()

  const fetchCurrentIncomes = async () => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const date = new Date()
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const { success, result } = (await incomeApi.getCurrentIncome()) as {
        success: boolean
        result: {
          expectedIncomes: { source: string; amount: number; date: Date }[]
          totalExpectedIncomes: number
          lastUpdate: Date
        }
      }

      if (success) {
        incomeStore.setSummary({
          totalExpected: result.totalExpectedIncomes,
          expectedIncomes: result.expectedIncomes,
          period: { year, month },
          lastUpdate: result.lastUpdate
        })
      }

      return { success, result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching incomes'
      incomeStore.setError(errorMessage)
      return { success: false, result: null }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  // Orchestration: fetch planned incomes
  const fetchPlannedIncomes = async () => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const { success, result } = await incomeApi.getPlannedIncomes()

      if (success && result) {
        incomeStore.setIncomes(result as unknown as Income[])
      }

      return { success, result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching planned incomes'
      incomeStore.setError(errorMessage)
      return { success: false, result: null }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  // Orchestration: create income
  const createIncome = async (data: Record<string, unknown>) => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const { success } = await incomeApi.createPlannedIncome(data)

      if (!success) {
        incomeStore.setError('Error al crear ingreso planificado')
      } else {
        await fetchPlannedIncomes()
      }

      return { success }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear ingreso planificado'
      incomeStore.setError(errorMessage)
      return { success: false }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  // Orchestration: update income
  const updateIncome = async (id: string, data: Record<string, unknown>) => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const { success } = await incomeApi.updatePlannedIncome(id, data)

      if (!success) {
        incomeStore.setError('Error al actualizar ingreso planificado')
      } else {
        await fetchPlannedIncomes()
      }

      return { success }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar ingreso planificado'
      incomeStore.setError(errorMessage)
      return { success: false }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  // Orchestration: delete income
  const deleteIncome = async (id: string) => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const { success } = await incomeApi.deletePlannedIncome(id)

      if (!success) {
        incomeStore.setError('Error al eliminar ingreso planificado')
      } else {
        await fetchPlannedIncomes()
      }

      return { success }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al eliminar ingreso planificado'
      incomeStore.setError(errorMessage)
      return { success: false }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  // Orchestration: mark income as received
  const markAsReceived = async (id: string) => {
    try {
      incomeStore.setLoading(true)
      incomeStore.setError(null)

      const { success } = await incomeApi.markPlannedIncomeAsReceived(id)

      if (!success) {
        incomeStore.setError('Error al marcar ingreso como recibido')
      } else {
        await fetchPlannedIncomes()
      }

      return { success }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al marcar ingreso como recibido'
      incomeStore.setError(errorMessage)
      return { success: false }
    } finally {
      incomeStore.setLoading(false)
    }
  }

  return {
    // State
    expectedIncomes,
    summary,
    isLoading,
    error,

    // Actions (orchestration methods only)
    fetchCurrentIncomes,
    fetchPlannedIncomes,
    createIncome,
    updateIncome,
    deleteIncome,
    markAsReceived
  }
}
