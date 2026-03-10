<script setup lang="ts">
  import { Text } from '@/components/atoms'

  import NavigationItem from './NavigationItem.vue'

  interface MenuItem {
    name: string
    icon: string
    path: string
    isActive?: boolean
  }

  interface NavigationSectionProps {
    /** Section title */
    title: string
    /** Menu items for this section */
    items: MenuItem[]
    /** Custom classes */
    className?: string
  }

  withDefaults(defineProps<NavigationSectionProps>(), {
    className: ''
  })
</script>

<template>
  <div :class="['mb-8', className]">
    <Text
      as="span"
      size="xs"
      weight="semibold"
      color="muted"
      class="mb-3 block px-3 uppercase tracking-wider"
    >
      {{ title }}
    </Text>
    <ul class="space-y-1">
      <li v-for="item in items" :key="item.name">
        <NavigationItem
          :name="item.name"
          :icon="item.icon"
          :path="item.path"
          :is-active="item.isActive"
        />
      </li>
    </ul>
  </div>
</template>
