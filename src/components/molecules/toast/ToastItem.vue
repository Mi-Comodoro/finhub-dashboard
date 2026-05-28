<script setup lang="ts">
  import type { Toast } from '@/components/organisms/toast/useToast'

  defineProps<{
    toast: Toast
  }>()

  const emit = defineEmits(['close'])
</script>

<template>
  <div class="toast-item" :class="`toast-item--${toast.type || 'info'}`">
    <div class="toast-item__body">
      <p class="toast-item__title">
        {{ toast.title }}
      </p>

      <p v-if="toast.description" class="toast-item__description">
        {{ toast.description }}
      </p>
    </div>

    <button class="toast-item__close" @click="emit('close')">✕</button>
  </div>
</template>

<style scoped lang="postcss">
  .toast-item {
    @apply flex items-start justify-between rounded-xl border-l-4 bg-white p-4 shadow-lg;
    @apply dark:bg-neutral-800 dark:shadow-neutral-900;
  }

  .toast-item--success {
    @apply border-green-500;
  }

  .toast-item--error {
    @apply border-red-500;
  }

  .toast-item--warning {
    @apply border-yellow-500;
  }

  .toast-item--info {
    @apply border-blue-500;
  }

  .toast-item__body {
    @apply flex-1;
  }

  .toast-item__title {
    @apply text-sm font-semibold text-neutral-900;
    @apply dark:text-neutral-100;
  }

  .toast-item__description {
    @apply text-xs text-neutral-500;
    @apply dark:text-neutral-400;
  }

  .toast-item__close {
    @apply ml-3 text-neutral-400 transition-colors hover:text-neutral-600;
    @apply dark:text-neutral-500 dark:hover:text-neutral-300;
  }
</style>
