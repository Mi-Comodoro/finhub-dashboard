<script setup lang="ts">
  import { Icon, Link, Text } from '@/components/atoms'

  import type { NavigationItemProps } from './types/navigation-item.types'

  const props = withDefaults(defineProps<NavigationItemProps>(), {
    isActive: false,
    className: ''
  })

  const emit = defineEmits<{
    click: []
  }>()

  const handleClick = async () => {
    emit('click')

    if (props.onClick) {
      await props.onClick()
    }
  }
</script>

<template>
  <Link
    v-if="path"
    :to="path"
    :class="['nav-item', isActive ? 'nav-item--active' : 'nav-item--inactive', className]"
  >
    <Icon :name="icon" size="lg" />
    <Text size="sm" color="inherit" weight="medium">
      {{ name }}
    </Text>
  </Link>
  <button
    v-else
    type="button"
    :class="['nav-item nav-item--inactive w-full', className]"
    @click="handleClick"
  >
    <Icon :name="icon" size="lg" />
    <Text size="sm" color="inherit" weight="medium">
      {{ name }}
    </Text>
  </button>
</template>

<style lang="postcss" scoped>
  .nav-item {
    @apply flex items-center gap-3 rounded px-3 py-2.5 outline-none transition-all duration-200;
  }
  .nav-item--active {
    @apply rounded-md border-y-0 border-l-8 border-r-0 border-primary-900 bg-slate-200 font-bold text-primary-900;
    @apply hover:bg-primary-900 hover:text-white;
    @apply dark:bg-primary-600 dark:text-white dark:hover:bg-primary-900;
  }
  .nav-item--inactive {
    @apply rounded-r-none text-slate-600 hover:border-l-8 hover:border-primary-900 hover:bg-slate-200 hover:text-primary-900;
    @apply active:bg-primary-100;
    @apply dark:text-slate-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300;
    @apply dark:active:bg-primary-900/30;
  }
</style>
