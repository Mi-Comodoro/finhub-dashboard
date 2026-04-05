import { useModalStore } from '@/stores/modal.store'
export function useApiHandler() {
  const authStore = useAuthStore()
  const modalStore = useModalStore()
  const router = useRouter()

  const handleError = (error: { status: number; title: string; message: string }) => {
    if (error?.status === 401) {
      authStore.clearAuth()
      return router.push('/')
    }

    modalStore.showModal('error', {
      title: error?.title,
      message: error?.message,
      actionLabel: 'Aceptar'
    })
  }

  return { handleError }
}
