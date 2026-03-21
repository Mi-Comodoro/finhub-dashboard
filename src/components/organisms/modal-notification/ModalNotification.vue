<!--
  ModalNotification
  Organism component for managing success and error process notifications
-->

<script setup lang="ts">
  import { ref, watch } from 'vue'

  import { Button, Heading, Text } from '@/components/atoms'
  import { IconChip } from '@/components/molecules'

  import type {
    ModalNotificationProps,
    NotificationOptions
  } from './types/modal-notification.types'

  const props = withDefaults(defineProps<ModalNotificationProps>(), {
    show: false,
    type: 'success',
    options: () =>
      ({
        title: '',
        message: '',
        actionLabel: undefined,
        titleIcon: undefined,
        hideTitle: false,
        onAction: undefined,
        onClose: undefined
      }) as NotificationOptions,

    onClose: undefined
  })

  const visible = ref(props.show)

  watch(
    () => props.show,
    val => {
      visible.value = val
    }
  )

  function handleAction() {
    if (props.options.onAction) props.options.onAction()
    visible.value = false
  }

  function handleClose() {
    if (props.options.onClose) props.options.onClose()
    if (props.onClose) props.onClose()
    visible.value = false
  }

  const typeStyles = computed(() => {
    switch (props.type) {
      case 'success':
        return {
          icon: 'check_circle',
          iconClass: 'modal-notification__title-icon--success'
        }

      case 'error':
        return {
          icon: 'error',
          iconClass: 'modal-notification__title-icon--error'
        }

      case 'info':
        return {
          icon: 'info',
          iconClass: 'modal-notification__title-icon--info'
        }

      case 'warning':
        return {
          icon: 'alert_triangle',
          iconClass: 'modal-notification__title-icon--warning'
        }

      default:
        return {
          icon: 'info',
          iconClass: 'modal-notification__title-icon--info'
        }
    }
  })
</script>

<template>
  <div v-if="visible" class="modal-notification" role="dialog" aria-modal="true">
    <div class="modal-notification__overlay" @click="handleClose" />
    <div class="modal-notification__container modal-notification__container--wide">
      <div class="modal-notification__content">
        <div v-if="!options.hideTitle && options.title" class="modal-notification__title-row">
          <IconChip
            :icon="typeStyles.icon"
            :class="['modal-notification__title-icon', typeStyles.iconClass]"
          />
          <Heading level="h2">{{ options.title }}</Heading>
        </div>
        <Text size="xs" variant="paragraph" class="modal-notification__message">
          {{ options.message }}
        </Text>
        <Button
          v-if="options.actionLabel"
          variant="ghost"
          size="sm"
          class="modal-notification__action"
          @click="handleAction"
        >
          {{ options.actionLabel }}
        </Button>
        <Button
          class="modal-notification__close"
          aria-label="Cerrar"
          icon="close"
          icon-only
          @click="handleClose"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .modal-notification {
    @apply fixed inset-0 z-50 flex items-center justify-center;
  }
  .modal-notification__overlay {
    @apply absolute inset-0 bg-black bg-opacity-40;
  }
  .modal-notification__container {
    @apply relative flex w-full max-w-md flex-col items-center rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800;
  }
  .modal-notification__container--wide {
    @apply max-w-md;
  }
  .modal-notification__title-row {
    @apply mb-1 flex items-center gap-3;
  }
  .modal-notification__title-icon {
    @apply justify-self-start bg-secondary-100 text-secondary-500;
  }
  .modal-notification__icon {
    @apply mb-2 text-3xl;
  }
  .modal-notification__title-icon--success {
    @apply bg-success-100 text-success-600;
  }

  .modal-notification__title-icon--error {
    @apply bg-danger-100 text-danger-600;
  }

  .modal-notification__title-icon--info {
    @apply bg-secondary-100 text-secondary-500;
  }

  .modal-notification__title-icon--warning {
    @apply bg-warning-100 text-warning-600;
  }
  .modal-notification__content {
    @apply w-full text-center;
  }
  .modal-notification__title {
    @apply mb-1 w-full text-lg font-semibold;
  }
  .modal-notification__message {
    @apply my-4 text-center text-sm text-slate-700 dark:text-slate-300;
  }

  .modal-notification__close {
    @apply absolute right-2 top-2 cursor-pointer border-none bg-transparent text-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200;
  }
</style>
