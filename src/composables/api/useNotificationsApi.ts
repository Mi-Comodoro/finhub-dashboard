import type { AppNotification } from '@/types/notifications.types'

export const useNotificationsApi = () => {
  const getNotifications = async () =>
    $fetch<{ success: boolean; result: AppNotification[] }>('/api/notifications')

  const markAllRead = async () =>
    $fetch<{ success: boolean }>('/api/notifications/read-all', { method: 'PATCH' })

  const markRead = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/notifications/${id}`, { method: 'PATCH' })

  return { getNotifications, markAllRead, markRead }
}
