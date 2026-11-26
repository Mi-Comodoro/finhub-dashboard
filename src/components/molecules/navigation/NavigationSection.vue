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
  <div :class="['navigation-section', className]">
    <Text
      v-if="!collapsed"
      as="span"
      size="xs"
      weight="semibold"
      color="muted"
      class="navigation-section__title"
    >
      {{ title }}
    </Text>
    <ul class="navigation-section__list">
      <li v-for="item in items" :key="item.name">
        <NavigationItem
          :name="item.name"
          :icon="item.icon"
          :path="item.path"
          :is-active="item.isActive"
          :on-click="item.onClick"
          :collapsed="collapsed"
          :class-name="item.className"
          :badge="item.badge"
          @navigate="emit('navigate')"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="postcss">
  .navigation-section {
    @apply mb-1 2xl:mb-2;
  }

  .navigation-section__title {
    @apply mb-2 block px-2 uppercase tracking-wider;
  }

  .navigation-section__list {
    @apply space-y-1;
  }
</style>
