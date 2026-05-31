import type { AppNotification } from '@/types/notifications.types'

export const useNotificationsApi = () => {
  const getNotifications = async (page = 1, limit = 50) =>
    $fetch<{ success: boolean; result: AppNotification[]; total: number }>(
      `/api/notifications?page=${page}&limit=${limit}`
    )

  const markAllRead = async () =>
    $fetch<{ success: boolean }>('/api/notifications/read-all', { method: 'PATCH' })

  const markRead = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/notifications/${id}`, { method: 'PATCH' })

  const deleteNotification = async (id: string) =>
    $fetch<{ success: boolean }>(`/api/notifications/${id}`, { method: 'DELETE' })

  const deleteAllNotifications = async () =>
    $fetch<{ success: boolean }>('/api/notifications/all', { method: 'DELETE' })

  return { getNotifications, markAllRead, markRead, deleteNotification, deleteAllNotifications }
}
