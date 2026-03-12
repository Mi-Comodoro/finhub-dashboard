<script setup lang="ts">
  import { Card, Heading } from '@/components/atoms'
  import { IconChip } from '@/components/molecules'

  import type { EditableInfoCardProps } from './types/editable-info-card.types'

  withDefaults(defineProps<EditableInfoCardProps>(), {
    iconContainerClass: '',
    variant: 'default',
    isEditing: false,
    showEditButton: true,
    editButtonText: 'Editar'
  })

  const emit = defineEmits(['edit'] as const)
</script>

<template>
  <Card variant="elevated" :class-name="`editable-info-card editable-info-card--${variant}`">
    <div :class="['editable-info-card__header', `editable-info-card__header--${variant}`]">
      <div class="editable-info-card__title-group">
        <IconChip :icon="icon" :container-class="iconContainerClass" />
        <Heading level="h2" size="lg" weight="semibold" class-name="editable-info-card__title">
          {{ title }}
        </Heading>
      </div>
      <button
        v-if="showEditButton"
        class="text-sm font-medium text-secondary-600 transition-colors hover:text-secondary-700 focus:outline-none dark:text-secondary-400"
        @click="emit('edit')"
      >
        {{ editButtonText }}
      </button>
    </div>

    <div
      v-if="!isEditing"
      :class="[
        'editable-info-card__content',
        'editable-info-card__content--view',
        `editable-info-card__content--${variant}`
      ]"
    >
      <slot name="view" />
    </div>

    <div v-else :class="['editable-info-card__content', `editable-info-card__content--${variant}`]">
      <slot name="edit" />
    </div>
  </Card>
</template>

<style lang="postcss" scoped>
  .editable-info-card__header {
    @apply flex items-center justify-between border-b border-slate-100 p-6;
  }

  .editable-info-card__header--compact {
    @apply p-4;
  }

  .editable-info-card__title-group {
    @apply flex items-center space-x-3;
  }

  .editable-info-card__title {
    @apply text-slate-900;
  }

  .editable-info-card__content {
    @apply p-6;
  }

  .editable-info-card__content--compact {
    @apply p-4;
  }

  .editable-info-card__content--view {
    @apply divide-y divide-slate-100;
  }
</style>
