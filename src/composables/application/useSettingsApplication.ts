import { storeToRefs } from 'pinia'

import type { BudgetDefaults, NotificationSettings } from '@/stores/settings.store'
import { useSettingsStore } from '@/stores/settings.store'

import { useSettingsApi } from '../api/useSettingsApi'

export const useSettingsApplication = () => {
  const settingsStore = useSettingsStore()
  const { notifications, budgetDefaults, currency, isLoading, error } = storeToRefs(settingsStore)
  const settingsApi = useSettingsApi()

  // Orchestration: load settings
  const loadSettings = async () => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.getSettings()

      if (success && result) {
        settingsStore.setSettings({
          notifications: result.notifications,
          budgetDefaults: result.budgetDefaults,
          currency: result.currency
        })
      }

      return { success, result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración'
      settingsStore.setError(errorMessage)
      return { success: false, result: null }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  // Orchestration: update notifications
  const updateNotifications = async (notifications: NotificationSettings) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateNotifications(notifications)

      if (success && result) {
        settingsStore.setNotifications(result.notifications)
      } else {
        settingsStore.setError('Error al actualizar notificaciones')
      }

      return { success }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar notificaciones'
      settingsStore.setError(errorMessage)
      return { success: false }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  // Orchestration: update budget defaults
  const updateBudgetDefaults = async (budgetDefaults: BudgetDefaults) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateBudgetDefaults(budgetDefaults)

      if (success && result) {
        settingsStore.setBudgetDefaults(result.budgetDefaults)
      } else {
        settingsStore.setError('Error al actualizar configuración de presupuesto')
      }

      return { success }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar configuración de presupuesto'
      settingsStore.setError(errorMessage)
      return { success: false }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  // Orchestration: update currency
  const updateCurrency = async (currency: string) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateCurrency(currency)

      if (success && result) {
        settingsStore.setCurrency(result.currency)
      } else {
        settingsStore.setError('Error al actualizar moneda')
      }

      return { success }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar moneda'
      settingsStore.setError(errorMessage)
      return { success: false }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  // Orchestration: update all settings
  const updateSettings = async (settings: {
    notifications?: NotificationSettings
    budgetDefaults?: BudgetDefaults
    currency?: string
  }) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateSettings(settings)

      if (success && result) {
        settingsStore.setSettings({
          notifications: result.notifications,
          budgetDefaults: result.budgetDefaults,
          currency: result.currency
        })
      } else {
        settingsStore.setError('Error al actualizar configuración')
      }

      return { success }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuración'
      settingsStore.setError(errorMessage)
      return { success: false }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  return {
    // State
    notifications,
    budgetDefaults,
    currency,
    isLoading,
    error,

    // Actions (orchestration methods only)
    loadSettings,
    updateNotifications,
    updateBudgetDefaults,
    updateCurrency,
    updateSettings
  }
}
