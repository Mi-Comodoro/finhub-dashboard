export type NotificationType = 'success' | 'error' | 'info'
export interface NotificationOptions {
  title?: string
  message: string
  actionLabel?: string
  titleIcon?: string
  hideTitle?: boolean
}

export interface ModalNotificationProps {
  show: boolean
  type: NotificationType
  options: NotificationOptions
  onAction?: () => void
  onClose?: () => void
}

export interface ModalNotificationState {
  show: boolean
  type: NotificationType
  options: NotificationOptions
}
