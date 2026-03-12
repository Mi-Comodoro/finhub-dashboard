<script setup lang="ts">
  import { ModalNotification } from '@/components/organisms/modal-notification'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'

  const { modalState, hideModal } = useModalNotification()
</script>

<template>
  <div class="onboarding-layout">
    <ModalNotification
      :show="modalState.show"
      :type="modalState.type"
      :options="modalState.options"
      :on-close="hideModal"
    />
    <slot />
  </div>
</template>

<style scoped>
  .onboarding-layout {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }
</style>
