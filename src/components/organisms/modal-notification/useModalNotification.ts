import { ref } from 'vue'

import type {
  ModalNotificationState,
  NotificationOptions,
  NotificationType
} from './types/modal-notification.types'

const modalState = ref<ModalNotificationState>({
  show: false,
  type: 'success',
  options: {
    title: '',
    message: '',
    actionLabel: ''
  } as NotificationOptions
})

function showModal(type: NotificationType, options: NotificationOptions) {
  modalState.value = {
    show: true,
    type,
    options: {
      title: options.title || '',
      message: options.message,
      actionLabel: options.actionLabel || ''
    }
  }
}

function hideModal() {
  modalState.value.show = false
}

export function useModalNotification() {
  return {
    showModal,
    hideModal
  }
}
