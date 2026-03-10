<script setup lang="ts">
  interface UserAvatarProps {
    name: string
    avatar?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
  }

  withDefaults(defineProps<UserAvatarProps>(), {
    avatar: null,
    size: 'md',
    className: ''
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const sizeClasses = {
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
      'flex items-center justify-center rounded-full bg-primary-600 font-medium text-white',
      sizeClasses[size],
      className
    ]"
  >
    <NuxtImg
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="h-full w-full rounded-full object-cover"
    />
    <span v-else>{{ getInitials(name) }}</span>
  </div>
</template>
