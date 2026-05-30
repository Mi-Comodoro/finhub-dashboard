<script setup lang="ts">
  /**
   * ProfileHeader Component
   * Organism-level component for displaying user profile header
   */

  import UserAvatar from '@/components/atoms/avatar/UserAvatar.vue'
  import Badge from '@/components/atoms/badge/Badge.vue'
  import Card from '@/components/atoms/card/Card.vue'
  import Icon from '@/components/atoms/icons/Icon.vue'
  import StatusIndicator from '@/components/atoms/status-indicator/StatusIndicator.vue'

  import type { ProfileHeaderProps } from './types/profile-header.types'

  withDefaults(defineProps<ProfileHeaderProps>(), {
    statusText: 'Cuenta Activa',
    planLabel: 'Nivel Pro'
  })
</script>

<template>
  <div class="profile-header">
    <Card variant="elevated" class-name="profile-header__card">
      <div class="profile-header__content">
        <div class="profile-header__avatar">
          <UserAvatar
            :avatar="user?.photo"
            :name="user?.displayName || 'Usuario'"
            size="xl"
            class-name="profile-header__avatar-img"
          />
          <div v-if="isVerified" class="profile-header__verified">
            <Icon name="photo_camera" class="profile-header__verified-icon" />
          </div>
        </div>
        <div class="profile-header__info">
          <Heading level="h1" size="2xl" weight="bold" class-name="profile-header__title">
            {{ user?.displayName || 'Usuario' }}
          </Heading>
          <Text size="sm" color="muted" class="profile-header__email">
            {{ user?.email || 'usuario@ejemplo.com' }}
          </Text>
          <div class="profile-header__status-group">
            <div class="profile-header__status-indicator">
              <StatusIndicator :status="user?.status || 'active'" :text="statusText" size="sm" />
            </div>
            <Badge variant="secondary" size="sm">{{ planLabel }}</Badge>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped lang="postcss">
  .profile-header {
    @apply mx-auto w-full px-6 pt-6;
  }
  .profile-header__card {
    @apply rounded-2xl border-slate-100 bg-slate-50 p-5 md:p-6;
  }
  .profile-header__content {
    @apply flex items-center gap-4 md:gap-5;
  }
  .profile-header__avatar {
    @apply relative shrink-0;
  }
  .profile-header__avatar-img {
    @apply h-20 w-20 ring-4 ring-primary-500;
  }
  .profile-header__verified {
    @apply absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600;
  }
  .profile-header__verified-icon {
    @apply text-sm text-white;
  }
  .profile-header__info {
    @apply min-w-0;
  }
  .profile-header__title {
    @apply truncate;
  }
  .profile-header__email {
    @apply truncate;
  }
  .profile-header__status-group {
    @apply mt-2 flex flex-wrap items-center gap-2;
  }
  .profile-header__status-indicator {
    @apply inline-flex items-center rounded-full bg-green-100 px-2.5 py-1;
  }
</style>
