import type { NotificationType } from '~/components/organisms/modal-notification/types'

// stores/modal.ts
export const useModalStore = defineStore('modal', () => {
  const initialState = {
    show: false,
    type: 'info' as NotificationType,
    options: {
      title: '',
      message: '',
      actionLabel: '',
      onAction: undefined as (() => void) | undefined,
      onClose: undefined as (() => void) | undefined
    }
  }

  const state = ref({ ...initialState })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function showModal(type: NotificationType, options: any) {
    state.value.type = type
    state.value.options = options
    state.value.show = true
  }

  function hideModal() {
    // IMPORTANTE: Ejecutar onClose antes de limpiar si existe
    if (state.value.options.onClose) state.value.options.onClose()
    state.value.show = false
  }

  return { state, showModal, hideModal }
})
