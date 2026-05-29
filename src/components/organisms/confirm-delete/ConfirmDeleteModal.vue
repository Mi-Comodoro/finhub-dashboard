<script setup lang="ts">
  import Button from '@/components/atoms/button/Button.vue'
  import IconBadge from '@/components/atoms/icons/IconBadge.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import ModalWizard from '@/components/organisms/modal-wizard/ModalWizard.vue'

  import type { ConfirmDeleteModalProps } from './types/confirm-delete.types'

  const props = withDefaults(defineProps<ConfirmDeleteModalProps>(), {
    show: false,
    description: 'Esta acción no se puede deshacer.'
  })

  const emit = defineEmits<{
    'update:show': [value: boolean]
    confirm: []
    cancel: []
  }>()

  const handleConfirm = () => {
    emit('confirm')
    emit('update:show', false)
  }

  const handleCancel = () => {
    emit('cancel')
    emit('update:show', false)
  }
</script>

<template>
  <ModalWizard :show="props.show">
    <div class="confirm-delete">
      <div class="confirm-delete__icon">
        <IconBadge icon="delete_forever" variant="danger" size="lg" />
      </div>
      <div class="confirm-delete__body">
        <Heading level="h2" size="xl" weight="semibold">{{ title }}</Heading>
        <Text v-if="description" size="sm" color="muted">{{ description }}</Text>
      </div>
      <div class="confirm-delete__actions">
        <Button variant="ghost" size="sm" @click="handleCancel">Cancelar</Button>
        <Button variant="danger" size="sm" icon="delete_forever" @click="handleConfirm">
          Eliminar
        </Button>
      </div>
    </div>
  </ModalWizard>
</template>

<style scoped lang="postcss">
  .confirm-delete {
    @apply flex flex-col items-center gap-6 py-4 text-center;
  }

  .confirm-delete__icon {
    @apply flex justify-center;
  }

  .confirm-delete__body {
    @apply flex flex-col gap-2;
  }

  .confirm-delete__actions {
    @apply flex w-full justify-end gap-2;
  }
</style>
