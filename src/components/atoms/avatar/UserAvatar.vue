<script setup lang="ts">
  import type { AvatarSize, UserAvatarProps } from './types/user-avatar.types'

  withDefaults(defineProps<UserAvatarProps>(), {
    avatar: null,
    size: 'md',
    className: ''
  })

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
    <NuxtImg
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="h-full w-full rounded-full object-cover"
      :class="sizeClasses[size]"
    />
    <span v-else class="bg-primary-500">{{ getInitials(name) }}</span>
  </div>
</template>
