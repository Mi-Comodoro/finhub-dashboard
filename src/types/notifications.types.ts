export type NotificationType = 'friend_request' | 'friend_accepted' | 'friend_rejected'

export interface NotificationPayload {
  senderId?: string
  senderHandle?: string
  senderDisplayName?: string
}

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  payload: NotificationPayload
  isRead: boolean
  createdAt: string
}
