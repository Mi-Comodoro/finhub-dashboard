// stores/breadcrumbs.store.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { BreadcrumbItem } from '@/components/molecules/breadcrumbs/types'

export const useBreadcrumbsStore = defineStore('breadcrumbs', () => {
  // State
  const items = ref<BreadcrumbItem[]>([])
  const customItems = ref<BreadcrumbItem[]>([])

  // Getters
  const hasItems = computed(() => items.value.length > 0)
  const lastItem = computed(() => items.value[items.value.length - 1])
  const firstItem = computed(() => items.value[0])

  // Actions
  const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
    items.value = breadcrumbs
  }

  const addBreadcrumb = (crumb: BreadcrumbItem) => {
    items.value.push(crumb)
  }

  const removeLastBreadcrumb = () => {
    items.value.pop()
  }

  const clearBreadcrumbs = () => {
    items.value = []
  }

  const setCustomBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
    customItems.value = breadcrumbs
  }

  const clearCustomBreadcrumbs = () => {
    customItems.value = []
  }

  const updateBreadcrumb = (index: number, crumb: Partial<BreadcrumbItem>) => {
    if (items.value[index]) {
      items.value[index] = { ...items.value[index], ...crumb }
    }
  }

  return {
    // State
    items,
    customItems,

    // Getters
    hasItems,
    lastItem,
    firstItem,

    // Actions
    setBreadcrumbs,
    addBreadcrumb,
    removeLastBreadcrumb,
    clearBreadcrumbs,
    setCustomBreadcrumbs,
    clearCustomBreadcrumbs,
    updateBreadcrumb
  }
})
