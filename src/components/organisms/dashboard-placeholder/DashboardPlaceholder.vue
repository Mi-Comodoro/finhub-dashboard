<script setup lang="ts">
  import { Heading, Text } from '@/components/atoms'
  import { ComingSoonCard } from '@/components/molecules'

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
