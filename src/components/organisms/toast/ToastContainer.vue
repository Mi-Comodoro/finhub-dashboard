<script setup lang="ts">
  import { ToastItem } from '@/components/molecules'
  import { useToast } from '@/components/organisms/toast/useToast'

  const { toasts, remove } = useToast()
</script>

<template>
  <div class="fixed right-4 top-4 z-50 w-80 space-y-2">
    <TransitionGroup name="toast">
      <ToastItem v-for="toast in toasts" :key="toast.id" :toast="toast" @close="remove(toast.id)" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.25s ease;
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
</style>
