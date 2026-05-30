<script setup lang="ts">
  import ThemeToggle from '@/components/atoms/theme/ThemeToggle.vue'
  import UserAvatarDropdown from '@/components/business/layout/UserAvatarDropdown.vue'
  import NotificationCenter from '@/components/molecules/notification/NotificationCenter.vue'
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
          : accountType?.toUpperCase() === 'PRO'
            ? 'Pro'
            : accountType?.toUpperCase() === 'PLUS'
              ? 'Plus'
              : accountType?.toUpperCase() === 'PARTNER'
                ? 'Partner'
                : 'Gratis'
      }}
    </Badge>

    <!-- Theme toggle -->
    <ThemeToggle size="sm" />

    <!-- Help button -->
    <NuxtLink to="/dashboard/help" class="header-actions__help-btn" title="Ayuda">
      <span class="material-symbols-outlined header-actions__help-icon">help_outline</span>
    </NuxtLink>

    <!-- Notification Center -->
    <NotificationCenter :notifications="notifications" />

    <!-- User Avatar Dropdown -->
    <UserAvatarDropdown class="ml-2" />
  </div>
</template>

<style scoped lang="postcss">
  .header-actions__help-btn {
    @apply flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors duration-150;
    @apply hover:bg-neutral-100 hover:text-primary-600;
    @apply dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-primary-400;
  }

  .header-actions__help-icon {
    font-size: 1.25rem;
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 24;
  }
</style>
