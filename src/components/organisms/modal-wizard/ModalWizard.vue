<!-- ModalWizard: Organism modal wrapper for onboarding wizard -->
<script setup lang="ts">
  import Button from '@/components/atoms/button/Button.vue'

  import type { ModalWizardProps } from './types/modal-wizard.types'

  const props = withDefaults(defineProps<ModalWizardProps>(), {
    show: false,
    title: undefined,
    onClose: undefined,
    protectUnsaved: true
  })

  const emit = defineEmits(['update:show'])

  const modalRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    modalRef.value?.focus()
    document.body.classList.add('overflow-hidden')
  })

  onUnmounted(() => {
    document.body.classList.remove('overflow-hidden')
  })

  // Datos sin guardar: se marca al editar cualquier campo dentro del modal
  const isDirty = ref(false)
  const showDiscardConfirm = ref(false)

  const handleContentEdit = (e: Event) => {
    const target = e.target as HTMLElement | null
    if (target?.matches('input, textarea, select')) isDirty.value = true
  }

  watch(
    () => props.show,
    () => {
      isDirty.value = false
      showDiscardConfirm.value = false
    }
  )

  const handleOverlayClick = () => {
    if (props.protectUnsaved && isDirty.value) {
      showDiscardConfirm.value = true
      return
    }
    handleClose()
  }

  const handleClose = () => {
    emit('update:show', false)
    props.onClose?.()
  }
</script>

<template>
  <div
    v-if="show"
    ref="modalRef"
    class="modal-wizard"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    @keydown.esc.stop="handleClose"
  >
    <div class="modal-wizard__overlay" @click="handleOverlayClick" />
    <div class="modal-wizard__container modal-wizard__container--auto">
      <div class="modal-wizard__content" @input="handleContentEdit" @change="handleContentEdit">
        <slot />
      </div>
      <div v-if="showDiscardConfirm" class="modal-wizard__discard" role="alertdialog">
        <p class="modal-wizard__discard-text">Tienes cambios sin guardar. ¿Deseas descartarlos?</p>
        <div class="modal-wizard__discard-actions">
          <Button variant="ghost" size="sm" @click="showDiscardConfirm = false">
            Seguir editando
          </Button>
          <Button variant="danger" size="sm" @click="handleClose">Descartar</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .modal-wizard {
    @apply fixed inset-0 z-50 flex items-center justify-center outline-none;
  }
  .modal-wizard__overlay {
    @apply absolute inset-0 bg-black bg-opacity-40;
  }
  .modal-wizard__container {
    @apply relative flex flex-col rounded-xl bg-white shadow-lg dark:bg-neutral-800;
  }
  .modal-wizard__container--auto {
    @apply h-auto max-h-[90vh] w-full max-w-[650px] overflow-hidden p-8;
  }
  .modal-wizard__content {
    @apply flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto;
  }
  .modal-wizard__discard {
    @apply mt-4 flex flex-col gap-2 rounded-lg border border-warning-200 bg-warning-50 p-3 dark:border-warning-700 dark:bg-neutral-900;
  }
  .modal-wizard__discard-text {
    @apply text-xs font-medium text-warning-700 dark:text-warning-300;
  }
  .modal-wizard__discard-actions {
    @apply flex justify-end gap-2;
  }
</style>
