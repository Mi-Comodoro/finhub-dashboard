<script setup lang="ts">
  import { NotificationCenter } from '@/components/molecules'
  import UserAvatarDropdown from '@/components/business/layout/UserAvatarDropdown.vue'
  import { useAuthStore } from '~/stores/auth.store'

  import type { HeaderActionsProps } from './types/header-actions.types'

  withDefaults(defineProps<HeaderActionsProps>(), {
    className: ''
  })

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

    <!-- User Avatar Dropdown -->
    <UserAvatarDropdown class="ml-2" />
  </div>
</template>
