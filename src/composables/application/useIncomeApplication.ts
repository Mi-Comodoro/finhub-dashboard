import { storeToRefs } from 'pinia'

import { useIncomeApi } from '~/composables/api/useIncomeApi'
import { useIncomeStore } from '~/stores/income.store'

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

      const { success, result } = await incomeApi.getCurrentIncome() as {
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

  return {
    // State
    expectedIncomes,
    summary,
    isLoading,
    error,

    // Actions
    fetchCurrentIncomes,

    // Store actions
    addIncome: incomeStore.addIncome,
    updateIncome: incomeStore.updateIncome,
    removeIncome: incomeStore.removeIncome,
    clearIncomeData: incomeStore.clearIncomeData
  }
}
