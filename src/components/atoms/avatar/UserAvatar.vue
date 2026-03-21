<script setup lang="ts">
  import { useUserStore } from '@/stores/user.store'

  import type { AvatarSize, UserAvatarProps } from './types/user-avatar.types'

  const userStore = useUserStore()
  withDefaults(defineProps<UserAvatarProps>(), {
    size: 'md',
    className: ''
  })

  const user = computed(() => userStore.userInfo)

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }

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
    :class="[
      'flex items-center justify-center rounded-full font-medium text-white',
      sizeClasses[size],
      className
    ]"
  >
    <span
      v-if="!user.photo"
      class="flex h-full w-full items-center justify-center rounded-full bg-primary-500 font-medium text-white"
    >
      {{ getInitials(user.name ?? 'Avatar') }}
    </span>
    <NuxtImg
      v-else
      :src="user.photo"
      :alt="user.name ?? 'Avatar'"
      class="h-full w-full rounded-full object-cover"
      :class="sizeClasses[size]"
      @error="e => console.log('Error cargando imagen:', e)"
    />
  </div>
</template>
