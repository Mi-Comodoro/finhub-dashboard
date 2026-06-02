<script setup lang="ts">
  import ModalNotification from '@/components/organisms/modal-notification/ModalNotification.vue'
  import { useModalStore } from '@/stores/modal.store'
  import { usePageLoading } from '~/composables/usePageLoading'
  import { useTheme } from '~/composables/useTheme'

  const { initTheme } = useTheme()
  const isPageLoading = usePageLoading()
  const modalStore = useModalStore()

  onMounted(() => {
    initTheme()
  })
</script>

<template>
  <div>
    <ModalNotification
      :show="modalStore.state.show"
      :type="modalStore.state.type"
      :options="modalStore.state.options"
      @update:show="modalStore.state.show = $event"
    />
    <Transition name="page-loading-fade">
      <div v-if="isPageLoading" class="page-loading">
        <div class="page-loading__spinner" />
      </div>
    </Transition>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="postcss">
  .page-loading {
    @apply fixed inset-0 z-[9999] flex items-center justify-center;
    @apply bg-white/70 backdrop-blur-sm;
    @apply dark:bg-neutral-900/70;
  }

  .page-loading__spinner {
    @apply h-12 w-12 animate-spin rounded-full;
    border: 4px solid theme('colors.neutral.200');
    border-top-color: theme('colors.primary.600');
  }

  .page-loading-fade-enter-active,
  .page-loading-fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .page-loading-fade-enter-from,
  .page-loading-fade-leave-to {
    opacity: 0;
  }
</style>
