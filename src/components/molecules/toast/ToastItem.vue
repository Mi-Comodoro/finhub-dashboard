<script setup lang="ts">
  import type { Toast } from '@/composables/useToast'

  defineProps<{
    toast: Toast
  }>()

  const emit = defineEmits(['close'])

  const typeStyles = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  }
</script>

<template>
  <div
    class="flex items-start justify-between rounded-xl border-l-4 bg-white p-4 shadow-lg"
    :class="typeStyles[toast.type || 'info']"
  >
    <div>
      <p class="text-sm font-semibold">
        {{ toast.title }}
      </p>

      <p v-if="toast.description" class="text-xs text-gray-500">
        {{ toast.description }}
      </p>
    </div>

    <button class="ml-3 text-gray-400 hover:text-gray-600" @click="emit('close')">✕</button>
  </div>
</template>
