<script setup lang="ts">
  import { Icon, Link, Text } from '@/components/atoms'

  import type { NavigationItemProps } from './types/navigation-item.types'

  withDefaults(defineProps<NavigationItemProps>(), {
    isActive: false,
    className: ''
  })
</script>

<template>
  <Link
    :to="path"
    :class="['nav-item', isActive ? 'nav-item--active' : 'nav-item--inactive', className]"
  >
    <Icon :name="icon" size="lg" />
    <Text as="span" size="sm" weight="medium" color="inherit">
      {{ name }}
    </Text>
  </Link>
</template>

<style lang="postcss" scoped>
  .nav-item {
    @apply flex items-center gap-3 rounded-lg px-3 py-2.5 outline-none transition-all duration-200;
  }
  .nav-item--active {
    @apply bg-primary-600 font-semibold text-white shadow-sm;
    @apply hover:bg-primary-700 hover:text-white;
    @apply dark:bg-primary-600 dark:text-white dark:hover:bg-primary-700;
  }
  .nav-item--inactive {
    @apply text-slate-600 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm;
    @apply active:bg-primary-100;
    @apply dark:text-slate-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300;
    @apply dark:active:bg-primary-900/30;
  }
</style>
