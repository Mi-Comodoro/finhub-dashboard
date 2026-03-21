export type NotificationType = 'success' | 'error' | 'info' | 'warning'
export interface NotificationOptions {
  title?: string
  message: string
  actionLabel?: string
  titleIcon?: string
  hideTitle?: boolean
  onAction?: () => void
  onClose?: () => void
}

export interface ModalNotificationProps {
  show: boolean
  type: NotificationType
  options: NotificationOptions
  onClose?: () => void
}

export interface ModalNotificationState {
  show: boolean
  type: NotificationType
  options: NotificationOptions
}
