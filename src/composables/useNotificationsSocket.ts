import { io, type Socket } from 'socket.io-client'

import { useNotificationsStore } from '@/stores/notifications.store'
import type { AppNotification } from '@/types/notifications.types'

const NOTIFICATION_LABELS: Record<string, { title: string; message: (handle?: string) => string }> =
  {
    friend_request: {
      title: 'Nueva solicitud de amistad',
      message: handle => (handle ? `@${handle} quiere ser tu amigo` : 'Tienes una nueva solicitud')
    },
    friend_accepted: {
      title: 'Solicitud aceptada',
      message: handle => (handle ? `@${handle} aceptó tu solicitud` : 'Tu solicitud fue aceptada')
    },
    friend_rejected: {
      title: 'Solicitud rechazada',
      message: handle => (handle ? `@${handle} rechazó tu solicitud` : 'Tu solicitud fue rechazada')
    }
  }

let socket: Socket | null = null

export const useNotificationsSocket = () => {
  const notificationsStore = useNotificationsStore()
  const config = useRuntimeConfig()
  const { success: successToast } = useFeedback()

  const connect = async () => {
    if (socket?.connected) return

    try {
      const { token } = await $fetch<{ token: string }>('/api/auth/ws-token')

      socket = io(config.public.wsBase as string, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      })

      socket.on('notification', (notification: AppNotification) => {
        notificationsStore.addNotification(notification)
        const label = NOTIFICATION_LABELS[notification.type]
        if (label) {
          successToast(label.title, label.message(notification.payload.senderHandle))
        }
      })

      socket.on('connect_error', () => {
        socket = null
      })
    } catch {
      // Fallo silencioso — el usuario puede seguir sin tiempo real
    }
  }

  const disconnect = () => {
    socket?.disconnect()
    socket = null
  }

  return { connect, disconnect }
}
