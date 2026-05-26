<script setup lang="ts">
  import Heading from '@/components/atoms/typography/Heading.vue'
  import Text from '@/components/atoms/typography/Text.vue'
  import ComingSoonCard from '@/components/molecules/coming-soon-card/ComingSoonCard.vue'

  import type { DashboardPlaceholderProps } from './types/dashboard-placeholder.types'

  defineProps<DashboardPlaceholderProps>()
</script>

<template>
  <div class="dashboard-placeholder">
    <div class="dashboard-placeholder__header">
      <Heading level="h1" size="2xl" weight="bold" class="dashboard-placeholder__title">
        {{ title }}
      </Heading>
      <Text color="muted">{{ description }}</Text>
    </div>
    <ComingSoonCard :icon="icon" />
  </div>
</template>

<style scoped lang="postcss">
  .dashboard-placeholder {
    @apply p-6;
  }
  .dashboard-placeholder__header {
    @apply mb-6;
  }
  .dashboard-placeholder__title {
    @apply mb-2;
  }
</style>
