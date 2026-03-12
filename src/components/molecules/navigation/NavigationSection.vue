<script setup lang="ts">
  import { Text } from '@/components/atoms'

  import NavigationItem from './NavigationItem.vue'
  import type { NavigationSectionProps } from './types/navigation-section.types'
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
