import { defineStore } from 'pinia'

import type { AppNotification } from '@/types/notifications.types'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as AppNotification[]
  }),
  getters: {
    unreadCount: state => state.notifications.filter(n => !n.isRead).length
  },
  actions: {
    setNotifications(data: AppNotification[]) {
      this.notifications = data
    },
    addNotification(notification: AppNotification) {
      this.notifications.unshift(notification)
    },
    markRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) notification.isRead = true
    },
    markAllRead() {
      this.notifications.forEach(n => (n.isRead = true))
    }
  }
})
