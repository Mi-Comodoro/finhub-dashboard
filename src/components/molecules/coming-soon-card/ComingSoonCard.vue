<script setup lang="ts">
  import { Card, Heading, IconBadge } from '@/components/atoms'

  import type { ComingSoonCardProps } from './types/coming-soon-card.types'

  withDefaults(defineProps<ComingSoonCardProps>(), {
    title: 'Próximamente',
    description: 'Esta funcionalidad estará disponible pronto'
  })
</script>

<template>
  <Card class-name="coming-soon-card">
    <IconBadge :icon="icon" container-class="coming-soon-card__icon" />
    <Heading level="h3" size="lg" weight="semibold" class-name="coming-soon-card__title">
      {{ title }}
    </Heading>
    <p class="coming-soon-card__description">{{ description }}</p>
  </Card>
</template>

<style lang="postcss" scoped>
  .coming-soon-card {
    @apply p-8 text-center;
    @apply dark:border-neutral-700 dark:bg-neutral-800;
  }

  .coming-soon-card__icon {
    @apply mx-auto mb-4 w-fit bg-neutral-100 text-neutral-600;
    @apply dark:bg-neutral-700 dark:text-neutral-300;
  }

  .coming-soon-card__title {
    @apply mb-2 text-neutral-900;
    @apply dark:text-white;
  }

  .coming-soon-card__description {
    @apply text-neutral-500;
    @apply dark:text-neutral-400;
  }
</style>
