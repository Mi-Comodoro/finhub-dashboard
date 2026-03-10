<script setup lang="ts">
  import { Heading, Text } from '@/components/atoms'
  import { ComingSoonCard } from '@/components/molecules'

  interface DashboardPlaceholderProps {
    title: string
    description: string
    icon: string
  }

  defineProps<DashboardPlaceholderProps>()
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <Heading level="h1" size="2xl" weight="bold" class="mb-2">
        {{ title }}
      </Heading>
      <Text color="muted">{{ description }}</Text>
    </div>

    <ComingSoonCard :icon="icon" />
  </div>
</template>
