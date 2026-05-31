<!-- ModalWizard: Organism modal wrapper for onboarding wizard -->
<script setup lang="ts">
  import type { ModalWizardProps } from './types/modal-wizard.types'

  const props = withDefaults(defineProps<ModalWizardProps>(), {
    show: false,
    title: undefined,
    onClose: undefined
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
    <div class="modal-wizard__overlay" @click="handleClose" />
    <div class="modal-wizard__container modal-wizard__container--auto">
      <div class="modal-wizard__content">
        <slot />
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
</style>
