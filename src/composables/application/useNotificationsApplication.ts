import { useNotificationsApi } from '@/composables/api/useNotificationsApi'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { AppNotification } from '@/types/notifications.types'

export const useNotificationsApplication = () => {
  const notificationsStore = useNotificationsStore()
  const { getNotifications, markAllRead, markRead, deleteNotification, deleteAllNotifications } =
    useNotificationsApi()

  const loadNotifications = async () => {
    try {
      const { result } = await getNotifications()
      notificationsStore.setNotifications(result ?? [])
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const loadNotificationsPaginated = async (
    page: number,
    limit = 15
  ): Promise<{ success: boolean; items: AppNotification[]; total: number }> => {
    try {
      const { result, total } = await getNotifications(page, limit)
      return { success: true, items: result ?? [], total: total ?? 0 }
    } catch {
      return { success: false, items: [], total: 0 }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      notificationsStore.markAllRead()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id)
      notificationsStore.markRead(id)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id)
      notificationsStore.removeNotification(id)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications()
      notificationsStore.clearAll()
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  return {
    loadNotifications,
    loadNotificationsPaginated,
    handleMarkAllRead,
    handleMarkRead,
    handleDeleteNotification,
    handleDeleteAll
  }
}
