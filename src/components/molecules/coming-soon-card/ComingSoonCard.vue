<script setup lang="ts">
  import { Card, Heading } from '@/components/atoms'
  import { IconChip } from '@/components/molecules'

  import type { ComingSoonCardProps } from './types/coming-soon-card.types'

  withDefaults(defineProps<ComingSoonCardProps>(), {
    title: 'Próximamente',
    description: 'Esta funcionalidad estará disponible pronto'
  })
</script>

<template>
  <Card class-name="coming-soon-card">
    <IconChip :icon="icon" container-class="coming-soon-card__icon" />
    <Heading level="h3" size="lg" weight="semibold" class-name="coming-soon-card__title">
      {{ title }}
    </Heading>
    <p class="coming-soon-card__description">{{ description }}</p>
  </Card>
</template>

<style lang="postcss" scoped>
  .coming-soon-card {
    @apply p-8 text-center;
    @apply dark:border-gray-700 dark:bg-gray-800;
  }

  .coming-soon-card__icon {
    @apply mx-auto mb-4 w-fit bg-gray-100 text-gray-600;
    @apply dark:bg-gray-700 dark:text-gray-300;
  }

  .coming-soon-card__title {
    @apply mb-2 text-gray-900;
    @apply dark:text-white;
  }

  .coming-soon-card__description {
    @apply text-gray-500;
    @apply dark:text-gray-400;
  }
</style>
