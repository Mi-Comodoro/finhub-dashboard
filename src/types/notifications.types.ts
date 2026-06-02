export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'announcement'
  | 'group_trip_invitation'
  | 'group_trip_accepted'

export type TripInvitationAction = 'accept_full' | 'accept_half' | 'accept_no_budget' | 'decline'

export interface NotificationPayload {
  senderId?: string
  senderHandle?: string
  senderDisplayName?: string
  title?: string
  body?: string
  // Group trip invitation
  groupId?: string
  groupName?: string
  goal?: number | null
  organizerPlannedAmount?: number
  inviterHandle?: string
}

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  payload: NotificationPayload
  isRead: boolean
  createdAt: string
}
