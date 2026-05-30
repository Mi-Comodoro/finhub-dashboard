import { useNotificationsApi } from '@/composables/api/useNotificationsApi'
import { useNotificationsStore } from '@/stores/notifications.store'

export const useNotificationsApplication = () => {
  const notificationsStore = useNotificationsStore()
  const { getNotifications, markAllRead, markRead } = useNotificationsApi()

  const loadNotifications = async () => {
    try {
      const { result } = await getNotifications()
      notificationsStore.setNotifications(result ?? [])
      return { success: true }
    } catch {
      return { success: false }
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

  return { loadNotifications, handleMarkAllRead, handleMarkRead }
}
