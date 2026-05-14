<script setup lang="ts">
  import { useUserStore } from '@/stores/user.store'

  import type { AvatarSize, UserAvatarProps } from './types/user-avatar.types'

  const userStore = useUserStore()
  withDefaults(defineProps<UserAvatarProps>(), {
    size: 'md',
    className: ''
  })

  const showPhoto = computed<boolean>(() => !!userStore.photo && !userStore.rejectPhoto)

  const initials = computed<string>(() => {
    const name = userStore.name ?? ''
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0] ?? '')
      .join('')
      .toUpperCase()
  })

  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  }
</script>

<template>
  <div
    class="user-avatar"
    :class="[sizeClasses[size], showPhoto ? 'user-avatar--photo' : 'user-avatar--initials', className]"
  >
    <NuxtImg
      v-if="showPhoto"
      :src="userStore.photo!"
      :alt="userStore.name ?? 'Avatar'"
      class="user-avatar__image"
      @error="() => { if (!userStore.rejectPhoto) console.warn('[UserAvatar] Error loading image') }"
    />
    <span v-else class="user-avatar__initials">{{ initials }}</span>
  </div>
</template>

<style scoped lang="postcss">
.user-avatar {
  @apply flex items-center justify-center rounded-full overflow-hidden;
}

.user-avatar--photo {
  @apply bg-transparent;
}

.user-avatar--initials {
  @apply bg-primary-500 font-medium text-white;
}

.user-avatar__image {
  @apply h-full w-full object-cover;
}

.user-avatar__initials {
  @apply flex items-center justify-center h-full w-full;
}
</style>
