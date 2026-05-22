import type { SettingsData } from '@/stores/settings.store'

export type UpdateSettingsDto = Pick<SettingsData, 'currency' | 'language' | 'notificationsEnabled'>
export type UpdateBudgetDefaultsDto = Pick<
  SettingsData,
  'budgetAlertThreshold' | 'savingsPercentage'
>

export function useSettingsApi() {
  const getSettings = async () =>
    $fetch<{ success: boolean; result: SettingsData }>('/api/settings')

  const updateSettings = async (dto: Partial<UpdateSettingsDto>) =>
    $fetch<{ success: boolean; result: SettingsData }>('/api/settings', {
      method: 'PATCH',
      body: dto
    })

  const updateBudgetDefaults = async (dto: Partial<UpdateBudgetDefaultsDto>) =>
    $fetch<{ success: boolean; result: SettingsData }>('/api/settings/budget-defaults', {
      method: 'PATCH',
      body: dto
    })

  return { getSettings, updateSettings, updateBudgetDefaults }
}
