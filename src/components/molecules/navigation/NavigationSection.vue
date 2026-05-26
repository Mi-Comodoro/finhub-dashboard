<script setup lang="ts">
  import Text from '@/components/atoms/typography/Text.vue'

  import NavigationItem from './NavigationItem.vue'
  import type { NavigationSectionProps } from './types/navigation-section.types'

  withDefaults(defineProps<NavigationSectionProps>(), {
    className: '',
    collapsed: false
  })

  const emit = defineEmits<{
    navigate: []
  }>()
</script>

<template>
  <div :class="['mb-2', className]">
    <Text
      v-if="!collapsed"
      as="span"
      size="xs"
      weight="semibold"
      color="muted"
      class="mb-2 block px-2 uppercase tracking-wider"
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
          :on-click="item.onClick"
          :collapsed="collapsed"
          :class-name="item.className"
          @navigate="emit('navigate')"
        />
      </li>
    </ul>
  </div>
</template>
