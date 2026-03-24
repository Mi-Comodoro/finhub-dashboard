import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

const toasts = ref<Toast[]>([])

let id = 0

export const useToast = () => {
  const show = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      id: ++id,
      duration: 3000,
      type: 'info',
      ...toast
    }

    toasts.value.push(newToast)

    setTimeout(() => {
      remove(newToast.id)
    }, newToast.duration)
  }

  const remove = (toastId: number) => {
    toasts.value = toasts.value.filter(t => t.id !== toastId)
  }

  return {
    toasts,
    show,
    remove
  }
}
