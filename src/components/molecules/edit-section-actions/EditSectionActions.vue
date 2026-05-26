<script setup lang="ts">
  import Button from '@/components/atoms/button/Button.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'

  import type { EditSectionActionsProps } from './types/edit-section-actions.types'

  withDefaults(defineProps<EditSectionActionsProps>(), {
    isSaving: false,
    saveLabel: 'Guardar',
    savingLabel: 'Guardando...'
  })

  const emit = defineEmits(['cancel', 'save'] as const)
</script>

<template>
  <div class="edit-section-actions">
    <Heading level="h3" size="lg" weight="semibold" class-name="edit-section-actions__title">
      {{ title }}
    </Heading>
    <div class="edit-section-actions__buttons">
      <Button
        variant="secondary"
        size="sm"
        icon="close"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        Cancelar
      </Button>
      <Button variant="primary" size="sm" icon="save" :disabled="isSaving" @click="emit('save')">
        {{ isSaving ? savingLabel : saveLabel }}
      </Button>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
  .edit-section-actions {
    @apply mb-4 flex items-center justify-between;
  }

  .edit-section-actions__title {
    @apply text-neutral-900;
  }

  .edit-section-actions__buttons {
    @apply flex space-x-2;
  }
</style>
