import { storeToRefs } from 'pinia'

import { useSettingsStore } from '@/stores/settings.store'

import type { UpdateBudgetDefaultsDto, UpdateSettingsDto } from '../api/useSettingsApi'
import { useSettingsApi } from '../api/useSettingsApi'

export const useSettingsApplication = () => {
  const settingsStore = useSettingsStore()
  const { settings, isLoading, error } = storeToRefs(settingsStore)
  const settingsApi = useSettingsApi()

  const fetchSettings = async () => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.getSettings()

      if (success && result) {
        settingsStore.setSettings(result)
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

  const updateSettings = async (dto: Partial<UpdateSettingsDto>) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateSettings(dto)

      if (success && result) {
        settingsStore.setSettings(result)
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

  const updateBudgetDefaults = async (dto: Partial<UpdateBudgetDefaultsDto>) => {
    try {
      settingsStore.setLoading(true)
      settingsStore.setError(null)

      const { success, result } = await settingsApi.updateBudgetDefaults(dto)

      if (success && result) {
        settingsStore.setSettings(result)
      } else {
        settingsStore.setError('Error al actualizar valores de presupuesto')
      }

      return { success }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al actualizar valores de presupuesto'
      settingsStore.setError(errorMessage)
      return { success: false }
    } finally {
      settingsStore.setLoading(false)
    }
  }

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    updateBudgetDefaults
  }
}
