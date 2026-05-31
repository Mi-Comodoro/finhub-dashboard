export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'announcement'

export interface NotificationPayload {
  senderId?: string
  senderHandle?: string
  senderDisplayName?: string
  title?: string
  body?: string
}

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  payload: NotificationPayload
  isRead: boolean
  createdAt: string
}
