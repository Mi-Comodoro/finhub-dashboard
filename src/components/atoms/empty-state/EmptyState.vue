<script setup lang="ts">
  import EmptyStateIllustration from '@/components/atoms/empty-state-illustration/EmptyStateIllustration.vue'
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'

  import type { EmptyStateProps } from './types/empty-state.types'

  withDefaults(defineProps<EmptyStateProps>(), {
    size: 'md',
    illustration: 'no-transactions'
  })
</script>

<template>
  <div class="empty-state" :class="`empty-state--${size}`">
    <EmptyStateIllustration :type="illustration" class="empty-state__illustration" />
    <Heading level="h3" size="lg" weight="semibold">{{ title }}</Heading>
    <Text v-if="description" size="sm" color="muted">{{ description }}</Text>
    <slot />
  </div>
</template>

<style scoped lang="postcss">
  .empty-state {
    @apply flex flex-col items-center gap-3 py-12 text-center;
  }

  .empty-state__illustration {
    @apply mx-auto h-32 w-32;
  }

  .empty-state--sm {
    @apply py-6;
  }

  .empty-state--sm .empty-state__illustration {
    @apply h-20 w-20;
  }

  .empty-state--lg {
    @apply py-16;
  }

  .empty-state--lg .empty-state__illustration {
    @apply h-40 w-40;
  }
</style>
