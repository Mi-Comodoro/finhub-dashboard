<script setup lang="ts">
  import { Icon } from '@/components/atoms'
  import { useTheme } from '@/composables/useTheme'

  interface ThemeToggleProps {
    /** Size of the toggle button */
    size?: 'sm' | 'md' | 'lg'
    /** Show text label */
    showLabel?: boolean
    /** Custom classes */
    className?: string
  }

  withDefaults(defineProps<ThemeToggleProps>(), {
    size: 'md',
    showLabel: false,
    className: ''
  })

  const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <span
    :class="[
      'relative flex cursor-pointer items-center justify-center rounded-md p-1 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
      className
    ]"
    aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="toggleTheme"
  >
    <Icon
      :name="isDark ? 'light_mode' : 'dark_mode'"
      :size="size === 'sm' ? 'sm' : 'md'"
      :class="['transition-transform duration-200', isDark ? 'rotate-180' : 'rotate-0']"
    />
    <span v-if="showLabel" class="text-sm font-medium">
      {{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}
    </span>
  </span>
</template>
