<!-- components/navigation/Breadcrumbs.vue -->
<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  import { Icon } from '@/components/atoms'
  import { useBreadcrumbs } from '@/components/molecules/breadcrumbs/useBreadcrumbs'

  import type { BreadcrumbItem } from './types'

  // Props
  interface Props {
    iconSize?: 'xs' | 'sm' | 'md' | 'lg'
    showHome?: boolean
    maxItems?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    iconSize: 'sm',
    maxItems: 5
  })

  // Emits

  // Router
  const route = useRoute()

  // Store

  // Composables
  const { generateBreadcrumbsFromRoute, truncateBreadcrumbs } = useBreadcrumbs()

  // Computed: Generate breadcrumbs
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    // Use custom items if provided

    // Generate from route
    let items = generateBreadcrumbsFromRoute(route, {
      showHome: props.showHome
    })

    // Truncate if needed
    if (items.length > props.maxItems) {
      items = truncateBreadcrumbs(items, props.maxItems)
    }

    return items
  })
</script>
<template>
  <nav
    v-if="breadcrumbs.length > 0"
    class="flex items-center space-x-1 text-sm"
    aria-label="Breadcrumb"
  >
    <ol class="flex flex-wrap items-center space-x-1">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.path || crumb.label"
        class="flex items-center"
      >
        <!-- Separator -->
        <Icon
          v-if="index > 0"
          name="chevron_right"
          size="sm"
          class="mx-1 text-slate-400 dark:text-slate-500"
        />

        <!-- Breadcrumb item -->
        <NuxtLink
          :is="crumb.isActive ? 'span' : 'router-link'"
          :to="crumb.path"
          :class="[
            'inline-flex items-center gap-1.5 text-xs transition-colors duration-200',
            crumb.isActive
              ? 'cursor-default font-medium text-slate-600 dark:text-slate-300'
              : 'text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400'
          ]"
          :aria-current="crumb.isActive ? 'page' : undefined"
        >
          <Icon v-if="crumb.icon" :name="crumb.icon" :size="iconSize" class="shrink-0" />
          <span class="max-w-[200px] truncate">{{ crumb.label }}</span>
        </NuxtLink>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
  /* Optional: Add fade transition for truncation */
  .truncate {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 768px) {
    .truncate {
      max-width: 300px;
    }
  }
</style>
