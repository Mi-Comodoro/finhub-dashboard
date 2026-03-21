<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth.store'
  import { useUserStore } from '~/stores/user.store'

  import type { UserBasicInformationProps } from './types/index'

  const userStore = useUserStore()
  const authStore = useAuthStore()

  const props = defineProps<UserBasicInformationProps & { displayName?: string }>()

  const form = ref<UserBasicInformationProps['modelValue']>({
    ...props.modelValue,
    displayName:
      props.displayName ??
      props.modelValue?.displayName ??
      userStore.displayName ??
      userStore.userInfo.name ??
      'Usuario',
    avatar: userStore.userInfo.photo ?? undefined,
    email: userStore.userInfo.email ?? undefined
  })

  watch(
    () => props.displayName,
    val => {
      form.value.displayName = val ?? 'Usuario'
    }
  )
</script>

<template>
  <div class="user-basic-information">
    <div class="user-basic-information__avatar-wrapper">
      <UserAvatar
        :avatar="form.avatar"
        :name="form.displayName ?? 'Usuario'"
        size="lg"
        class-name=" user-basic-information__avatar"
      />
      <div class="user-basic-information__photo-icon">
        <Icon name="photo_camera" class="text-sm text-white" />
      </div>
    </div>
    <div>
      <Heading level="h2" size="lg" weight="bold">
        {{ form.displayName ?? 'Usuario' }}
      </Heading>
      <Text size="sm" color="muted">
        {{ form.email ?? 'Correo no disponible' }}
      </Text>
      <div class="user-basic-information__status">
        <div class="user-basic-information__status-indicator">
          <StatusIndicator
            :status="userStore.userInfo.isActive ? 'active' : 'inactive'"
            :text="userStore.userInfo.isActive ? 'Activo' : 'Inactivo'"
            size="sm"
          />
        </div>
        <Badge variant="secondary" size="sm">
          {{ authStore.accountType === 'TRIAL' ? 'Plan de prueba' : 'Plan no disponible' }}
        </Badge>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .user-basic-information {
    @apply flex items-center gap-4 p-4 md:gap-5;
  }

  .user-basic-information__avatar-wrapper {
    @apply relative shrink-0;
  }

  .user-basic-information__avatar {
    @apply h-20 w-20 ring-4 ring-primary-500;
  }

  .user-basic-information__photo-icon {
    @apply absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-secondary-600;
  }
</style>
