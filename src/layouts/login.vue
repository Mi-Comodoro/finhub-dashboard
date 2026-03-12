<script setup lang="ts">
  // Initialize theme on app mount
  import { ModalNotification } from '@/components/organisms/modal-notification'
  import { useModalNotification } from '@/components/organisms/modal-notification/useModalNotification'
  import { useTheme } from '~/composables/useTheme'

  // Initialize theme on app mount
  const { initTheme } = useTheme()
  const { modalState, hideModal } = useModalNotification()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <div class="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
    <ModalNotification
      :show="modalState.show"
      :type="modalState.type"
      :options="modalState.options"
      :on-close="hideModal"
    />
    <slot />
  </div>
</template>
