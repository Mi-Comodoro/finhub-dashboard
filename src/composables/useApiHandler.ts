import { useModalStore } from '@/stores/modal.store'
export function useApiHandler() {
  const authStore = useAuthStore()
  const modalStore = useModalStore()
  const router = useRouter()

  const handleError = (error: { status: number; title: string; message: string }) => {
    if (error?.status === 401) {
      modalStore.showModal('warning', {
        title: 'Sesión expirada',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        actionLabel: 'Aceptar',
        onAction: () => {
          authStore.clearAuth()
          router.push('/')
        }
      })
      return
    }

    modalStore.showModal('error', {
      title: error?.title,
      message: error?.message,
      actionLabel: 'Aceptar'
    })
  }

  return { handleError }
}
