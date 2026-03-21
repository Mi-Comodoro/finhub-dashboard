<script setup lang="ts">
  import { UserAvatar } from '@/components/atoms'
  import { NotificationCenter } from '@/components/molecules'
  import { useUserStore } from '@/stores/user.store'
  import { useAuthStore } from '~/stores/auth.store'

  import type { HeaderActionsProps } from './types/header-actions.types'

  withDefaults(defineProps<HeaderActionsProps>(), {
    className: ''
  })

  const user = computed(() => userStore.userInfo)

  // User dropdown state
  const showUserDropdown = ref(false)
  const userDropdownRef = ref<HTMLElement | null>(null)

  // Mock notifications data
  const notifications = ref([
    {
      id: 1,
      title: 'Nueva transacción',
      message: 'Se registró un gasto de $50.000',
      time: '2 min',
      read: false
    },
    {
      id: 2,
      title: 'Meta alcanzada',
      message: 'Has completado tu meta de ahorro mensual',
      time: '1 hora',
      read: false
    },
    {
      id: 3,
      title: 'Recordatorio',
      message: 'Revisa tu presupuesto semanal',
      time: '3 horas',
      read: true
    }
  ])

  const { accountType } = useAuthStore()
  const userStore = useUserStore()

  // Logout function

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node | null

    if (userDropdownRef.value && target && !userDropdownRef.value.contains(target)) {
      showUserDropdown.value = false
    }
  }

  // Close user dropdown when clicking outside
  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })

  const userName = computed(() => user.value.displayName ?? user.value.name ?? 'Usuario')
</script>

<template>
  <div :class="['flex items-center', className]">
    <Badge variant="secondary" size="xs">
      {{
        accountType?.toUpperCase() === 'TRIAL'
          ? 'Periodo de Prueba'
          : accountType?.toUpperCase() === 'PREMIUM'
            ? 'Premium'
            : 'FREE'
      }}
    </Badge>

    <!-- Notification Center -->
    <NotificationCenter :notifications="notifications" />
    <UserAvatar :name="userName" class-name="ml-2" :avatar="user.photo!" />
  </div>
</template>
