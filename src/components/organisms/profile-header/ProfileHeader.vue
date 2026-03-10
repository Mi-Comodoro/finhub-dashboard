<script setup lang="ts">
  /**
   * ProfileHeader Component
   * Organism-level component for displaying user profile header
   */

  import { Badge, Card, Icon, StatusIndicator, UserAvatar } from '@/components/atoms'

  interface Props {
    user: {
      displayName?: string
      email?: string
      photo?: string
      phoneNumber?: string
      status?: 'active' | 'inactive' | 'pending' | 'error'
    }
    isVerified?: boolean
    statusText?: string
    planLabel?: string
  }

  withDefaults(defineProps<Props>(), {
    statusText: 'Cuenta Activa',
    planLabel: 'Nivel Pro'
  })
</script>

<template>
  <div class="mx-auto w-full px-6 pt-6">
    <Card variant="elevated" class-name="rounded-2xl border-slate-100 bg-slate-50 p-5 md:p-6">
      <div class="flex items-center gap-4 md:gap-5">
        <div class="relative shrink-0">
          <UserAvatar
            :avatar="user?.photo"
            :name="user?.displayName || 'Usuario'"
            size="xl"
            class-name="h-20 w-20 ring-4 ring-primary-500"
          />
          <div
            v-if="isVerified"
            class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600"
          >
            <Icon name="photo_camera" class="text-sm text-white" />
          </div>
        </div>

        <div class="min-w-0">
          <Heading level="h1" size="2xl" weight="bold" class-name="truncate">
            {{ user?.displayName || 'Usuario' }}
          </Heading>
          <Text size="sm" color="muted" class="truncate">
            {{ user?.email || 'usuario@ejemplo.com' }}
          </Text>

          <div class="mt-2 flex flex-wrap items-center gap-2">
            <div class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1">
              <StatusIndicator :status="user?.status || 'active'" :text="statusText" size="sm" />
            </div>
            <Badge variant="secondary" size="sm">{{ planLabel }}</Badge>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
