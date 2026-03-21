<!-- ModalWizard: Organism modal wrapper for onboarding wizard -->
<script setup lang="ts">
  import { ref } from 'vue'

  import type { ModalWizardProps } from './types/modal-wizard.types'

  const props = withDefaults(defineProps<ModalWizardProps>(), {
    show: false,
    title: undefined,
    onClose: undefined
  })

  const visible = ref(props.show)

  watch(
    () => props.show,
    val => {
      visible.value = val
    }
  )
</script>

<template>
  <div v-if="visible" class="modal-wizard" role="dialog" aria-modal="true">
    <div class="modal-wizard__overlay" />
    <div class="modal-wizard__container modal-wizard__container--auto">
      <div class="modal-wizard__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .modal-wizard {
    @apply fixed inset-0 z-50 flex items-center justify-center;
  }
  .modal-wizard__overlay {
    @apply absolute inset-0 top-[-51px] bg-black bg-opacity-40;
  }
  .modal-wizard__container {
    @apply relative flex flex-col overflow-hidden rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800;
  }
  .modal-wizard__header {
    @apply mb-4 flex items-center justify-between;
  }
  .modal-wizard__title {
    @apply text-xl font-semibold;
  }
  .modal-wizard__close {
    @apply cursor-pointer border-none bg-transparent text-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200;
  }
  .modal-wizard__container {
    @apply relative flex flex-col rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800;
  }
  .modal-wizard__container--auto {
    @apply h-min w-[650px] overflow-hidden p-8;
  }
  .modal-wizard__content {
    @apply flex h-full w-full flex-auto flex-col gap-6;
  }
</style>
