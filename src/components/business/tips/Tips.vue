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
  <Card class="flex w-full items-start gap-2">
    <IconBadge
      v-if="icon"
      :icon="icon"
      :variant="variant === 'success' ? 'success' : 'primary'"
      size="md"
    />

    <div class="w-full leading-relaxed">
      <Heading level="h1" size="sm" weight="extrabold" class="!text-primary-800">
        {{ title }}
      </Heading>

      <Text v-if="description" size="xs" color="muted">
        {{ description }}
      </Text>
      <Text size="xs" color="muted">
        <slot />
      </Text>
      <div v-if="actionLabel && event" class="flex justify-end">
        <Button size="sm" variant="primary" @click="event">
          {{ actionLabel }}
        </Button>
      </div>
    </div>
  </Card>
</template>
