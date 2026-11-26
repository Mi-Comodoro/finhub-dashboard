<script setup lang="ts">
  // Initialize theme on app mount
  import ModalNotification from '@/components/organisms/modal-notification/ModalNotification.vue'
  import { useModalStore } from '@/stores/modal.store'
  import { useTheme } from '~/composables/useTheme'
  const modalStore = useModalStore()
  // Initialize theme on app mount
  const { initTheme } = useTheme()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <div class="login-layout">
    <ModalNotification
      :show="modalStore.state.show"
      :type="modalStore.state.type"
      :options="modalStore.state.options"
      @update:show="modalStore.state.show = $event"
    />
    <slot />
  </div>
</template>

<style scoped lang="postcss">
  .login-layout {
    @apply h-screen w-full flex-1 items-center justify-center bg-neutral-50 transition-colors duration-200 dark:bg-neutral-900;
  }
</style>
