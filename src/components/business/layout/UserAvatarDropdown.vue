<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onClickOutside } from '@vueuse/core'

  import { useAuth } from '@/composables/useAuth'
  import { useUserStore } from '@/stores/user.store'

  import type { UserAvatarDropdownProps } from './types/user-avatar-dropdown.types'

  withDefaults(defineProps<UserAvatarDropdownProps>(), {
    userName: '',
    userEmail: '',
    avatarUrl: '',
  })

  const userStore = useUserStore()
  const { logout } = useAuth()

  const isOpen = ref(false)
  const dropdownRef = ref<HTMLElement | null>(null)

  onClickOutside(dropdownRef, () => {
    isOpen.value = false
  })

  const user = computed(() => userStore.userInfo)

  const initials = computed(() => {
    const name = user.value.displayName ?? user.value.name ?? ''
    if (!name) return '?'
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  })

  const handleLogout = async () => {
    isOpen.value = false
    await logout()
    await navigateTo('/')
  }
</script>

<template>
  <div ref="dropdownRef" class="user-avatar-dropdown">
    <button class="user-avatar-dropdown__trigger" @click="isOpen = !isOpen">
      <NuxtImg
        v-if="user.photo"
        :src="user.photo"
        :alt="user.displayName ?? user.name ?? 'Avatar'"
        class="user-avatar-dropdown__image"
      />
      <span v-else class="user-avatar-dropdown__initials">
        {{ initials }}
      </span>
    </button>

    <div v-if="isOpen" class="user-avatar-dropdown__menu">
      <div class="user-avatar-dropdown__user-info">
        <p class="user-avatar-dropdown__user-name">
          {{ user.displayName ?? user.name ?? 'Usuario' }}
        </p>
        <p class="user-avatar-dropdown__user-email">{{ user.email }}</p>
      </div>

      <div class="user-avatar-dropdown__divider" />

      <NuxtLink
        to="/dashboard/profile"
        class="user-avatar-dropdown__item"
        @click="isOpen = false"
      >
        <UIcon name="i-material-symbols-person-outline" class="user-avatar-dropdown__item-icon" />
        Mi Perfil
      </NuxtLink>

      <button class="user-avatar-dropdown__item user-avatar-dropdown__item--danger" @click="handleLogout">
        <UIcon name="i-material-symbols-logout" class="user-avatar-dropdown__item-icon" />
        Cerrar Sesión
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .user-avatar-dropdown {
    @apply relative;
  }

  .user-avatar-dropdown__trigger {
    @apply flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-all duration-200;
    @apply hover:border-primary-300 hover:ring-2 hover:ring-primary-100;
    @apply focus:outline-none focus:ring-2 focus:ring-primary-300;
  }

  .user-avatar-dropdown__image {
    @apply h-full w-full rounded-full object-cover;
  }

  .user-avatar-dropdown__initials {
    @apply flex h-full w-full items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white;
  }

  .user-avatar-dropdown__menu {
    @apply absolute right-0 top-11 z-50 min-w-52 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg;
  }

  .user-avatar-dropdown__user-info {
    @apply px-4 py-3;
  }

  .user-avatar-dropdown__user-name {
    @apply text-sm font-semibold text-neutral-900;
  }

  .user-avatar-dropdown__user-email {
    @apply mt-0.5 text-xs text-neutral-500;
  }

  .user-avatar-dropdown__divider {
    @apply mx-2 my-1 border-t border-neutral-100;
  }

  .user-avatar-dropdown__item {
    @apply flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors duration-150;
    @apply hover:bg-neutral-50 hover:text-neutral-900;
  }

  .user-avatar-dropdown__item--danger {
    @apply text-danger-600 hover:bg-danger-50 hover:text-danger-700;
  }

  .user-avatar-dropdown__item-icon {
    @apply h-4 w-4 flex-shrink-0;
  }
</style>
