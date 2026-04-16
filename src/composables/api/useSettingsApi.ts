import type { BudgetDefaults, NotificationSettings } from '@/stores/settings.store'

export interface SettingsResponse {
  notifications: NotificationSettings
  budgetDefaults: BudgetDefaults
  currency: string
}

export function useSettingsApi() {
  const getSettings = async () =>
    $fetch<{ success: boolean; result: SettingsResponse }>('/api/settings')

  const updateNotifications = async (notifications: NotificationSettings) =>
    $fetch<{ success: boolean; result: { notifications: NotificationSettings } }>(
      '/api/settings/notifications',
      {
        method: 'PATCH',
        body: notifications
      }
    )

  const updateBudgetDefaults = async (budgetDefaults: BudgetDefaults) =>
    $fetch<{ success: boolean; result: { budgetDefaults: BudgetDefaults } }>(
      '/api/settings/budget-defaults',
      {
        method: 'PATCH',
        body: budgetDefaults
      }
    )

  const updateCurrency = async (currency: string) =>
    $fetch<{ success: boolean; result: { currency: string } }>('/api/settings/currency', {
      method: 'PATCH',
      body: { currency }
    })

  const updateSettings = async (settings: Partial<SettingsResponse>) =>
    $fetch<{ success: boolean; result: SettingsResponse }>('/api/settings', {
      method: 'PATCH',
      body: settings
    })

  return {
    getSettings,
    updateNotifications,
    updateBudgetDefaults,
    updateCurrency,
    updateSettings
  }
}
