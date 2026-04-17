<script setup lang="ts">
  import { Button, Card, Heading, IconBadge, Text } from '@/components/atoms'

  defineProps<{
    title: string
    description?: string
    icon: string
    actionLabel?: string
    event?: () => void
    variant?: 'default' | 'success'
  }>()
</script>

<template>
  <Card class="tips">
    <IconBadge
      v-if="icon"
      :icon="icon"
      :variant="variant === 'success' ? 'success' : 'primary'"
      size="md"
    />

    <div class="tips__content">
      <Heading level="h1" size="sm" weight="extrabold" class="tips__title">
        {{ title }}
      </Heading>

      <Text v-if="description" size="xs" color="muted">
        {{ description }}
      </Text>
      <Text size="xs" color="muted">
        <slot />
      </Text>
      <div v-if="actionLabel && event" class="tips__actions">
        <Button size="sm" variant="primary" @click="event">
          {{ actionLabel }}
        </Button>
      </div>
    </div>
  </Card>
</template>

<style scoped lang="postcss">
  .tips {
    @apply flex w-full items-start gap-2;
  }

  .tips__content {
    @apply w-full leading-relaxed;
  }

  .tips__title {
    @apply !text-primary-800;
  }

  .tips__actions {
    @apply flex justify-end;
  }
</style>
